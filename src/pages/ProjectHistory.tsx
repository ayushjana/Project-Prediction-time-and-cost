import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/DashboardLayout';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

const formatCurrency = (n: number) => '₹' + n.toLocaleString('en-IN');

const ProjectHistory = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });
      setProjects(data || []);
      setLoading(false);
    };
    if (user) load();
  }, [user]);

  const filtered = projects.filter(p =>
    p.project_name?.toLowerCase().includes(search.toLowerCase()) ||
    p.project_type?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold text-foreground">Project History</h1>
          <p className="mt-1 text-muted-foreground">View all your previous predictions</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {loading ? (
          <div className="flex h-32 items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : filtered.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="p-4 font-medium">Project Name</th>
                   <th className="p-4 font-medium">Description</th>
                   <th className="p-4 font-medium">Type</th>
                  <th className="p-4 font-medium">Predicted Cost</th>
                  <th className="p-4 font-medium">Duration</th>
                  <th className="p-4 font-medium">Risk Score</th>
                  <th className="p-4 font-medium">Created</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id} className="border-b border-border/50 transition-colors hover:bg-secondary/30">
                    <td className="p-4">
                      <Link to={`/prediction/${p.id}`} className="font-medium text-foreground hover:text-primary">
                        {p.project_name}
                      </Link>
                    </td>
                    <td className="p-4 text-muted-foreground max-w-[200px] truncate">{p.description || '—'}</td>
                    <td className="p-4 text-muted-foreground">{p.project_type}</td>
                    <td className="p-4 text-foreground">{p.predicted_cost ? formatCurrency(p.predicted_cost) : '—'}</td>
                    <td className="p-4 text-foreground">{p.predicted_duration ? `${p.predicted_duration} mo` : '—'}</td>
                    <td className="p-4">
                      {p.risk_score != null && (
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          p.risk_score < 25 ? 'bg-success/10 text-success' :
                          p.risk_score < 50 ? 'bg-warning/10 text-warning' :
                          'bg-destructive/10 text-destructive'
                        }`}>
                          {p.risk_score}% — {p.risk_level}
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {new Date(p.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center text-muted-foreground">
            {search ? 'No projects match your search' : 'No projects yet'}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ProjectHistory;
