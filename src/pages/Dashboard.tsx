import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { PlusCircle, TrendingUp, Clock, AlertTriangle, DollarSign } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface Project {
  id: string;
  project_name: string;
  project_type: string;
  predicted_cost: number | null;
  predicted_duration: number | null;
  risk_score: number | null;
  created_at: string;
}

const formatCurrency = (n: number) =>
  '₹' + n.toLocaleString('en-IN');

const Dashboard = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
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

  const predicted = projects.filter(p => p.predicted_cost);
  const avgCost = predicted.length ? predicted.reduce((s, p) => s + (p.predicted_cost || 0), 0) / predicted.length : 0;
  const avgDuration = predicted.length ? predicted.reduce((s, p) => s + (p.predicted_duration || 0), 0) / predicted.length : 0;
  const highRisk = predicted.filter(p => (p.risk_score || 0) >= 50).length;

  const recentProjects = projects.slice(0, 5);

  const riskDistribution = [
    { name: 'Low', value: predicted.filter(p => (p.risk_score || 0) < 25).length, color: 'hsl(152, 70%, 45%)' },
    { name: 'Medium', value: predicted.filter(p => (p.risk_score || 0) >= 25 && (p.risk_score || 0) < 50).length, color: 'hsl(38, 92%, 50%)' },
    { name: 'High', value: predicted.filter(p => (p.risk_score || 0) >= 50).length, color: 'hsl(0, 72%, 51%)' },
  ].filter(d => d.value > 0);

  const costChart = predicted.slice(0, 8).map(p => ({
    name: p.project_name?.slice(0, 12) || 'Project',
    cost: Math.round((p.predicted_cost || 0) / 1000),
  }));

  const stats = [
    { label: 'Total Projects', value: projects.length, icon: TrendingUp, color: 'text-primary' },
    { label: 'Avg. Predicted Cost', value: avgCost ? formatCurrency(Math.round(avgCost)) : '—', icon: DollarSign, color: 'text-success' },
    { label: 'Avg. Duration', value: avgDuration ? `${avgDuration.toFixed(1)} months` : '—', icon: Clock, color: 'text-accent' },
    { label: 'Risk Alerts', value: highRisk, icon: AlertTriangle, color: 'text-warning' },
  ];

  return (
    <DashboardLayout>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold text-foreground">
            Welcome back, {user?.user_metadata?.name?.split(' ')[0] || 'User'}
          </h1>
          <p className="mt-1 text-muted-foreground">Here's an overview of your projects</p>
        </div>
        <Link to="/create-project">
          <Button variant="gradient" className="gap-2">
            <PlusCircle className="h-4 w-4" /> New Project
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(stat => (
          <div key={stat.label} className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="font-heading text-xl font-bold text-foreground">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Cost Chart */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="mb-4 font-heading text-lg font-semibold text-foreground">Project Costs (₹K)</h3>
          {costChart.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={costChart}>
                <XAxis dataKey="name" stroke="hsl(215, 15%, 55%)" fontSize={12} />
                <YAxis stroke="hsl(215, 15%, 55%)" fontSize={12} />
                <Tooltip contentStyle={{ background: 'hsl(222, 25%, 10%)', border: '1px solid hsl(222, 20%, 18%)', borderRadius: '8px', color: 'hsl(210, 20%, 92%)' }} />
                <Bar dataKey="cost" fill="hsl(187, 85%, 53%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[250px] items-center justify-center text-muted-foreground">No project data yet</div>
          )}
        </div>

        {/* Risk Pie */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="mb-4 font-heading text-lg font-semibold text-foreground">Risk Distribution</h3>
          {riskDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={riskDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {riskDistribution.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: 'hsl(222, 25%, 10%)', border: '1px solid hsl(222, 20%, 18%)', borderRadius: '8px', color: 'hsl(210, 20%, 92%)' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[250px] items-center justify-center text-muted-foreground">No risk data yet</div>
          )}
        </div>
      </div>

      {/* Recent Projects */}
      <div className="mt-8 rounded-xl border border-border bg-card p-6">
        <h3 className="mb-4 font-heading text-lg font-semibold text-foreground">Recent Projects</h3>
        {recentProjects.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="pb-3 font-medium">Name</th>
                  <th className="pb-3 font-medium">Type</th>
                  <th className="pb-3 font-medium">Cost</th>
                  <th className="pb-3 font-medium">Duration</th>
                  <th className="pb-3 font-medium">Risk</th>
                </tr>
              </thead>
              <tbody>
                {recentProjects.map(p => (
                  <tr key={p.id} className="border-b border-border/50">
                    <td className="py-3 font-medium text-foreground">
                      <Link to={`/prediction/${p.id}`} className="hover:text-primary">{p.project_name}</Link>
                    </td>
                    <td className="py-3 text-muted-foreground">{p.project_type}</td>
                    <td className="py-3 text-foreground">{p.predicted_cost ? formatCurrency(p.predicted_cost) : '—'}</td>
                    <td className="py-3 text-foreground">{p.predicted_duration ? `${p.predicted_duration} mo` : '—'}</td>
                    <td className="py-3">
                      {p.risk_score != null && (
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          p.risk_score < 25 ? 'bg-success/10 text-success' :
                          p.risk_score < 50 ? 'bg-warning/10 text-warning' :
                          'bg-destructive/10 text-destructive'
                        }`}>
                          {p.risk_score}%
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center text-muted-foreground">
            <p className="mb-4">No projects yet. Create your first project to get started!</p>
            <Link to="/create-project">
              <Button variant="gradient" className="gap-2">
                <PlusCircle className="h-4 w-4" /> Create Project
              </Button>
            </Link>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
