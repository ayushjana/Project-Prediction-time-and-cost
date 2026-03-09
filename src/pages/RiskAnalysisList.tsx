import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/DashboardLayout';
import { Shield, AlertTriangle, CheckCircle2 } from 'lucide-react';

const RiskAnalysisList = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('projects')
        .select('id, project_name, project_type, risk_score, risk_level, created_at')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });
      setProjects(data || []);
      setLoading(false);
    };
    if (user) load();
  }, [user]);

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold text-foreground">Risk Analysis</h1>
        <p className="mt-1 text-muted-foreground">Select a project to view its detailed risk analysis & mitigation suggestions</p>
      </div>

      {loading ? (
        <div className="flex h-32 items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : projects.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map(p => {
            const riskColor = (p.risk_score ?? 0) < 25 ? 'text-success' : (p.risk_score ?? 0) < 50 ? 'text-warning' : 'text-destructive';
            const riskBg = (p.risk_score ?? 0) < 25 ? 'bg-success/10' : (p.risk_score ?? 0) < 50 ? 'bg-warning/10' : 'bg-destructive/10';
            const Icon = (p.risk_score ?? 0) < 25 ? CheckCircle2 : AlertTriangle;

            return (
              <Link
                key={p.id}
                to={`/risk-analysis/${p.id}`}
                className="group rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/30"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${riskBg}`}>
                    <Icon className={`h-5 w-5 ${riskColor}`} />
                  </div>
                  {p.risk_score != null && (
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${riskBg} ${riskColor}`}>
                      {p.risk_score}%
                    </span>
                  )}
                </div>
                <h3 className="font-heading font-semibold text-foreground group-hover:text-primary transition-colors">
                  {p.project_name}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">{p.project_type}</p>
                {p.risk_level && (
                  <p className={`text-xs font-medium mt-2 ${riskColor}`}>Risk Level: {p.risk_level}</p>
                )}
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card p-12 text-center text-muted-foreground">
          <Shield className="mx-auto h-12 w-12 mb-3 opacity-50" />
          <p>No projects yet. Create a project first to analyze its risks.</p>
        </div>
      )}
    </DashboardLayout>
  );
};

export default RiskAnalysisList;
