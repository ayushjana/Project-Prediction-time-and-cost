import { Brain, ArrowRight, BarChart3, Shield, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const Landing = () => {
  const { user } = useAuth();

  const features = [
    { icon: Brain, title: 'AI-Powered Predictions', desc: 'Machine learning models analyze your project parameters to predict cost and timeline with high accuracy.' },
    { icon: Shield, title: 'Risk Analysis', desc: 'Identify potential risk factors before they become problems. Get actionable insights to mitigate delays.' },
    { icon: Clock, title: 'Timeline Generation', desc: 'Automatically generate phase-by-phase project timelines based on your specific project parameters.' },
    { icon: BarChart3, title: 'Monte Carlo Simulation', desc: 'Understand cost uncertainty with best-case, worst-case, and average projections for confident planning.' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Glow effect */}
      <div className="pointer-events-none fixed inset-0" style={{ background: 'var(--gradient-glow)' }} />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-4 lg:px-12">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-bg">
            <Brain className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-heading text-xl font-bold gradient-text">ProjectPredict AI</span>
        </div>
        <Link to={user ? '/dashboard' : '/auth'}>
          <Button variant="glow" size="sm">
            {user ? 'Dashboard' : 'Get Started'}
          </Button>
        </Link>
      </nav>

      {/* Hero */}
      <section className="relative z-10 mx-auto max-w-5xl px-6 py-24 text-center lg:py-32">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm text-muted-foreground">
          <span className="h-2 w-2 rounded-full gradient-bg animate-pulse" />
          Intelligent Project Estimation
        </div>
        <h1 className="mb-6 font-heading text-5xl font-bold leading-tight tracking-tight lg:text-7xl">
          Predict Project{' '}
          <span className="gradient-text">Cost & Timeline</span>{' '}
          with AI
        </h1>
        <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground">
          Stop guessing. Use machine learning to accurately estimate project costs, timelines, and risks before you start. Make data-driven decisions with confidence.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link to={user ? '/dashboard' : '/auth'}>
            <Button variant="gradient" size="lg" className="gap-2 px-8">
              Start Predicting <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 pb-24">
        <div className="grid gap-6 md:grid-cols-2">
          {features.map((feature, i) => (
            <div
              key={feature.title}
              className="group rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/30 hover:shadow-[var(--shadow-glow)]"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <feature.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="mb-2 font-heading text-lg font-semibold text-foreground">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border px-6 py-8 text-center text-sm text-muted-foreground">
        © 2026 ProjectPredict AI. Intelligent project estimation powered by machine learning.
      </footer>
    </div>
  );
};

export default Landing;
