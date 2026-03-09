import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import {
  DollarSign, Clock, AlertTriangle, ArrowLeft, TrendingUp, Shield, BarChart3
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
} from 'recharts';

const formatCurrency = (n: number) => '₹' + n.toLocaleString('en-IN');

const PredictionResults = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .eq('user_id', user?.id)
        .single();
      setProject(data);
      setLoading(false);
    };
    if (user && id) load();
  }, [user, id]);

  if (loading) return (
    <DashboardLayout>
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    </DashboardLayout>
  );

  if (!project) return (
    <DashboardLayout>
      <div className="text-center text-muted-foreground">Project not found</div>
    </DashboardLayout>
  );

  const timelineData = (project.timeline_phases || []).map((p: any) => ({
    name: p.phase,
    weeks: p.weeks,
  }));

  const monteCarloData = [
    { name: 'Best Case', value: project.monte_carlo_best, color: 'hsl(152, 70%, 45%)' },
    { name: 'Average', value: project.monte_carlo_avg, color: 'hsl(187, 85%, 53%)' },
    { name: 'Worst Case', value: project.monte_carlo_worst, color: 'hsl(0, 72%, 51%)' },
  ];

  const riskColor = project.risk_score < 25 ? 'text-success' : project.risk_score < 50 ? 'text-warning' : 'text-destructive';
  const riskBg = project.risk_score < 25 ? 'bg-success/10' : project.risk_score < 50 ? 'bg-warning/10' : 'bg-destructive/10';

  return (
    <DashboardLayout>
      <div className="mb-6">
        <Link to="/dashboard" className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Link>
        <h1 className="font-heading text-3xl font-bold text-foreground">{project.project_name}</h1>
        <p className="mt-1 text-muted-foreground">{project.project_type} • {project.complexity} Complexity • Team of {project.team_size}</p>
      </div>

      {/* Key Metrics */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-6 card-glow">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
              <DollarSign className="h-5 w-5 text-success" />
            </div>
            <span className="text-sm text-muted-foreground">Estimated Cost</span>
          </div>
          <p className="font-heading text-2xl font-bold text-foreground">{formatCurrency(project.predicted_cost)}</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 card-glow">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
              <Clock className="h-5 w-5 text-accent" />
            </div>
            <span className="text-sm text-muted-foreground">Estimated Duration</span>
          </div>
          <p className="font-heading text-2xl font-bold text-foreground">{project.predicted_duration} Months</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 card-glow">
          <div className="flex items-center gap-3 mb-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${riskBg}`}>
              <AlertTriangle className={`h-5 w-5 ${riskColor}`} />
            </div>
            <span className="text-sm text-muted-foreground">Delay Risk</span>
          </div>
          <p className={`font-heading text-2xl font-bold ${riskColor}`}>{project.risk_score}%</p>
          <span className={`mt-1 inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${riskBg} ${riskColor}`}>
            {project.risk_level}
          </span>
          <Link to={`/risk-analysis/${project.id}`} className="mt-2 inline-flex items-center gap-1 text-xs text-primary hover:underline">
            View Full Analysis →
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Risk Factors */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="mb-4 flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <h3 className="font-heading text-lg font-semibold text-foreground">Risk Analysis</h3>
          </div>
          {(project.risk_factors || []).length > 0 ? (
            <ul className="space-y-2">
              {project.risk_factors.map((rf: string, i: number) => (
                <li key={i} className="flex items-start gap-3 rounded-lg bg-secondary/50 px-4 py-3 text-sm">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
                  <span className="text-foreground">{rf}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">No significant risk factors detected.</p>
          )}
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-secondary/50 px-4 py-3">
            <span className="text-sm text-muted-foreground">Team Productivity Score:</span>
            <span className="font-heading font-bold text-primary">{project.team_productivity}%</span>
          </div>
        </div>

        {/* Timeline */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h3 className="font-heading text-lg font-semibold text-foreground">Project Timeline</h3>
          </div>
          <div className="space-y-3">
            {timelineData.map((phase: any, i: number) => (
              <div key={i} className="flex items-center gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                  {i + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">{phase.name}</span>
                    <span className="text-sm text-muted-foreground">{phase.weeks} weeks</span>
                  </div>
                  <div className="mt-1 h-2 w-full rounded-full bg-secondary">
                    <div
                      className="h-2 rounded-full gradient-bg"
                      style={{ width: `${Math.min((phase.weeks / (timelineData.reduce((s: number, p: any) => s + p.weeks, 0) || 1)) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Monte Carlo */}
        <div className="rounded-xl border border-border bg-card p-6 lg:col-span-2">
          <div className="mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            <h3 className="font-heading text-lg font-semibold text-foreground">Monte Carlo Cost Simulation</h3>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={monteCarloData} layout="vertical">
              <XAxis type="number" stroke="hsl(215, 15%, 55%)" fontSize={12} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}K`} />
              <YAxis type="category" dataKey="name" stroke="hsl(215, 15%, 55%)" fontSize={12} width={100} />
              <Tooltip
                contentStyle={{ background: 'hsl(222, 25%, 10%)', border: '1px solid hsl(222, 20%, 18%)', borderRadius: '8px', color: 'hsl(210, 20%, 92%)' }}
                formatter={(value: number) => [formatCurrency(value), 'Cost']}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {monteCarloData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PredictionResults;
