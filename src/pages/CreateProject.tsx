import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { predictProject } from '@/lib/prediction-engine';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Brain } from 'lucide-react';

const projectTypes = ['Software', 'Construction', 'AI', 'Website', 'Mobile App'];
const complexities = ['Low', 'Medium', 'High'];
const experienceLevels = ['Junior', 'Mid', 'Senior'];

const CreateProject = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    project_name: '',
    project_type: 'Software',
    complexity: 'Medium',
    team_size: '5',
    tech_stack: '',
    experience_level: 'Mid',
    estimated_requirements: '20',
    location: '',
    description: '',
  });

  const update = (key: string, value: string) => setForm(f => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Run prediction
      const prediction = predictProject({
        project_type: form.project_type,
        team_size: parseInt(form.team_size),
        complexity: form.complexity,
        experience_level: form.experience_level,
        tech_stack: form.tech_stack,
        estimated_requirements: parseInt(form.estimated_requirements),
        location: form.location,
      });

      // Save project
      const { data: project, error } = await supabase
        .from('projects')
        .insert({
          user_id: user!.id,
          project_name: form.project_name,
          description: form.description || null,
          project_type: form.project_type,
          complexity: form.complexity,
          team_size: parseInt(form.team_size),
          tech_stack: form.tech_stack,
          experience_level: form.experience_level,
          estimated_requirements: parseInt(form.estimated_requirements),
          location: form.location,
          predicted_cost: prediction.estimated_cost,
          predicted_duration: prediction.estimated_duration_months,
          risk_score: prediction.delay_risk_score,
          risk_level: prediction.risk_level,
          risk_factors: prediction.risk_factors,
          timeline_phases: prediction.timeline_phases,
          monte_carlo_best: prediction.monte_carlo.best_case,
          monte_carlo_worst: prediction.monte_carlo.worst_case,
          monte_carlo_avg: prediction.monte_carlo.average,
          team_productivity: prediction.team_productivity,
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Project created and prediction generated!');
      navigate(`/prediction/${project.id}`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  const selectClass = "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <h1 className="font-heading text-3xl font-bold text-foreground">Create New Project</h1>
          <p className="mt-1 text-muted-foreground">Enter project details to generate AI predictions</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 rounded-xl border border-border bg-card p-8">
          <div>
            <Label htmlFor="name">Project Name</Label>
            <Input id="name" value={form.project_name} onChange={e => update('project_name', e.target.value)} placeholder="My Awesome Project" required />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              value={form.description}
              onChange={e => update('description', e.target.value)}
              placeholder="Brief description of the project..."
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Project Type</Label>
              <select value={form.project_type} onChange={e => update('project_type', e.target.value)} className={selectClass}>
                {projectTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <Label>Complexity</Label>
              <select value={form.complexity} onChange={e => update('complexity', e.target.value)} className={selectClass}>
                {complexities.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Team Size</Label>
              <Input type="number" min="1" max="100" value={form.team_size} onChange={e => update('team_size', e.target.value)} required />
            </div>
            <div>
              <Label>Experience Level</Label>
              <select value={form.experience_level} onChange={e => update('experience_level', e.target.value)} className={selectClass}>
                {experienceLevels.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          </div>

          <div>
            <Label>Technology Stack</Label>
            <Input value={form.tech_stack} onChange={e => update('tech_stack', e.target.value)} placeholder="React + Node.js, Python, etc." required />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Estimated Requirements Count</Label>
              <Input type="number" min="1" max="500" value={form.estimated_requirements} onChange={e => update('estimated_requirements', e.target.value)} required />
            </div>
            <div>
              <Label>Location</Label>
              <Input value={form.location} onChange={e => update('location', e.target.value)} placeholder="India, US, Remote" required />
            </div>
          </div>

          <Button type="submit" variant="gradient" className="w-full gap-2" disabled={loading}>
            <Brain className="h-4 w-4" />
            {loading ? 'Generating Prediction...' : 'Generate AI Prediction'}
          </Button>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default CreateProject;
