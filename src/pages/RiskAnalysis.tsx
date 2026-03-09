import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { predictProject } from '@/lib/prediction-engine';
import DashboardLayout from '@/components/DashboardLayout';
import {
  ArrowLeft, Shield, AlertTriangle, CheckCircle2, Lightbulb, TrendingDown, Users, Layers
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const severityConfig = {
  Low: { color: 'text-success', bg: 'bg-success/10', border: 'border-success/20' },
  Medium: { color: 'text-warning', bg: 'bg-warning/10', border: 'border-warning/20' },
  High: { color: 'text-destructive', bg: 'bg-destructive/10', border: 'border-destructive/20' },
  Critical: { color: 'text-destructive', bg: 'bg-destructive/20', border: 'border-destructive/30' },
};

const RiskAnalysis = () => {
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

  // Re-run prediction to get risk_details (since they aren't stored in DB)
  const prediction = predictProject({
    project_type: project.project_type,
    team_size: project.team_size,
    complexity: project.complexity,
    experience_level: project.experience_level,
    tech_stack: project.tech_stack || '',
    estimated_requirements: project.estimated_requirements,
    location: project.location || '',
  });

  const riskDetails = prediction.risk_details;
  const riskColor = project.risk_score < 25 ? 'text-success' : project.risk_score < 50 ? 'text-warning' : 'text-destructive';
  const riskBg = project.risk_score < 25 ? 'bg-success/10' : project.risk_score < 50 ? 'bg-warning/10' : 'bg-destructive/10';

  const severityCounts = [
    { name: 'Low', value: riskDetails.filter(r => r.severity === 'Low').length, color: 'hsl(152, 70%, 45%)' },
    { name: 'Medium', value: riskDetails.filter(r => r.severity === 'Medium').length, color: 'hsl(38, 92%, 50%)' },
    { name: 'High', value: riskDetails.filter(r => r.severity === 'High').length, color: 'hsl(0, 72%, 51%)' },
    { name: 'Critical', value: riskDetails.filter(r => r.severity === 'Critical').length, color: 'hsl(0, 85%, 40%)' },
  ].filter(d => d.value > 0);

  const overallSuggestions = [
    { icon: Users, text: 'Conduct weekly risk review meetings with the team to proactively identify emerging issues.' },
    { icon: Layers, text: 'Maintain a risk register and update it at every milestone to track mitigation progress.' },
    { icon: TrendingDown, text: 'Build buffer time (10-20%) into each phase to absorb unexpected delays.' },
  ];

  return (
    <DashboardLayout>
      <div className="mb-6">
        <Link to={`/prediction/${project.id}`} className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to Prediction Results
        </Link>
        <h1 className="font-heading text-3xl font-bold text-foreground">Risk Analysis</h1>
        <p className="mt-1 text-muted-foreground">{project.project_name} — Detailed risk breakdown & mitigation plan</p>
      </div>

      {/* Risk Overview Cards */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-6">
          <p className="text-sm text-muted-foreground mb-1">Overall Risk Score</p>
          <p className={`font-heading text-3xl font-bold ${riskColor}`}>{project.risk_score}%</p>
          <span className={`mt-2 inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${riskBg} ${riskColor}`}>
            {project.risk_level}
          </span>
        </div>
        <div className="rounded-xl border border-border bg-card p-6">
          <p className="text-sm text-muted-foreground mb-1">Risk Factors Detected</p>
          <p className="font-heading text-3xl font-bold text-foreground">{riskDetails.length}</p>
          <p className="mt-1 text-xs text-muted-foreground">Across all severity levels</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-6">
          <p className="text-sm text-muted-foreground mb-1">Team Productivity</p>
          <p className="font-heading text-3xl font-bold text-primary">{project.team_productivity}%</p>
          <p className="mt-1 text-xs text-muted-foreground">Based on team size & experience</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Severity Chart */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="mb-4 font-heading text-lg font-semibold text-foreground flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" /> Severity Breakdown
          </h3>
          {severityCounts.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={severityCounts} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {severityCounts.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: 'hsl(222, 25%, 10%)', border: '1px solid hsl(222, 20%, 18%)', borderRadius: '8px', color: 'hsl(210, 20%, 92%)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[220px] items-center justify-center text-muted-foreground">
              <div className="text-center">
                <CheckCircle2 className="mx-auto h-10 w-10 text-success mb-2" />
                <p>No significant risks detected!</p>
              </div>
            </div>
          )}
        </div>

        {/* General Suggestions */}
        <div className="rounded-xl border border-border bg-card p-6 lg:col-span-2">
          <h3 className="mb-4 font-heading text-lg font-semibold text-foreground flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-accent" /> General Recommendations
          </h3>
          <div className="space-y-3">
            {overallSuggestions.map((s, i) => (
              <div key={i} className="flex items-start gap-3 rounded-lg bg-secondary/50 px-4 py-3">
                <s.icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <p className="text-sm text-foreground">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detailed Risk Factors with Suggestions */}
      <div className="mt-8">
        <h3 className="mb-4 font-heading text-xl font-semibold text-foreground">Detailed Risk Factors & Mitigation</h3>
        {riskDetails.length > 0 ? (
          <div className="space-y-4">
            {riskDetails.map((risk, i) => {
              const config = severityConfig[risk.severity];
              return (
                <div key={i} className={`rounded-xl border ${config.border} bg-card p-6`}>
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <AlertTriangle className={`h-5 w-5 ${config.color}`} />
                        <h4 className="font-heading font-semibold text-foreground">{risk.factor}</h4>
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${config.bg} ${config.color}`}>
                          {risk.severity}
                        </span>
                      </div>
                      <div className="mb-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-muted-foreground">Impact Level</span>
                          <span className={`text-xs font-medium ${config.color}`}>{risk.impact}%</span>
                        </div>
                        <div className="h-2 w-full max-w-xs rounded-full bg-secondary">
                          <div
                            className={`h-2 rounded-full ${risk.severity === 'Low' ? 'bg-success' : risk.severity === 'Medium' ? 'bg-warning' : 'bg-destructive'}`}
                            style={{ width: `${risk.impact}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-lg bg-primary/5 border border-primary/10 px-4 py-3 flex items-start gap-3">
                    <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
                    <div>
                      <p className="text-xs font-medium text-primary mb-1">Suggested Mitigation</p>
                      <p className="text-sm text-foreground">{risk.suggestion}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-xl border border-success/20 bg-success/5 p-8 text-center">
            <CheckCircle2 className="mx-auto h-12 w-12 text-success mb-3" />
            <h4 className="font-heading text-lg font-semibold text-foreground mb-1">Low Risk Project</h4>
            <p className="text-sm text-muted-foreground">No significant risk factors were detected for this project. Continue with standard project management practices.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default RiskAnalysis;
