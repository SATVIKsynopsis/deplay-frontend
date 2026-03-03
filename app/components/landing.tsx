'use client'

import { Button } from '@/components/ui/button'
import { ArrowRight, Zap, Shield, Cpu, GitBranch, Code2, Sparkles, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-card/30">
      {/* Grid Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-10" />
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Code2 className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg">Deplay</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition">Features</a>
            <a href="#how" className="text-sm text-muted-foreground hover:text-foreground transition">How it works</a>
            <a href="#benefits" className="text-sm text-muted-foreground hover:text-foreground transition">Benefits</a>
          </div>
          <a href="http://3.111.147.73:8080/auth/github">
            <Button size="sm" className="gap-2">
              Launch App <ArrowRight className="w-4 h-4" />
            </Button>
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 border border-secondary/20">
              <Sparkles className="w-4 h-4 text-secondary" />
              <span className="text-sm text-secondary font-medium">Powered by AI Analysis</span>
            </div>
            
            <div className="space-y-4">
              <h1 className="text-5xl sm:text-6xl font-bold tracking-tight">
                Deploy with <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">confidence</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-xl">
                Test your repositories before deployment with instant AI-powered analysis. Catch issues early and deploy faster.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <a href="http://3.111.147.73:8080/auth/github">
                <Button size="lg" className="w-full sm:w-auto">
                  Get Started <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </a>
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                View Docs
              </Button>
            </div>

            <div className="flex items-center gap-8 pt-8 border-t border-border/40">
              <div>
                <p className="text-sm text-muted-foreground">Used by developers at</p>
                <div className="flex gap-4 mt-3">
                  <div className="text-xs font-medium text-foreground/40">Vercel</div>
                  <div className="text-xs font-medium text-foreground/40">OpenAI</div>
                  <div className="text-xs font-medium text-foreground/40">Stripe</div>
                </div>
              </div>
            </div>
          </div>

          {/* Hero Image - Code Preview */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl blur-3xl" />
            <div className="relative bg-card/50 backdrop-blur-sm border border-border/40 rounded-xl p-6 space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-destructive" />
                <div className="w-3 h-3 rounded-full bg-warning" />
                <div className="w-3 h-3 rounded-full bg-primary" />
              </div>
              <div className="space-y-3 font-mono text-sm">
                <div className="text-muted-foreground">{'> npm run analyze'}</div>
                <div className="text-primary">✓ Repository analyzed</div>
                <div className="text-muted-foreground">{'→'} Security checks: <span className="text-success">Passed</span></div>
                <div className="text-muted-foreground">{'→'} Build validation: <span className="text-success">Passed</span></div>
                <div className="text-muted-foreground">{'→'} Dependencies: <span className="text-success">Healthy</span></div>
                <div className="mt-4 text-secondary">Ready to deploy! 🚀</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-20 border-t border-border/40">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Powerful Features</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to test and validate your code before deployment
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: Shield,
              title: "Security Analysis",
              description: "Automatic detection of vulnerabilities, insecure patterns, and dependency issues"
            },
            {
              icon: Zap,
              title: "Performance Checks",
              description: "Identify performance bottlenecks and optimization opportunities instantly"
            },
            {
              icon: Cpu,
              title: "Build Validation",
              description: "Verify build success and catch compilation errors before deployment"
            },
            {
              icon: GitBranch,
              title: "Git Integration",
              description: "Direct integration with your GitHub repositories for seamless workflow"
            },
            {
              icon: Code2,
              title: "Code Quality",
              description: "Analyze code complexity and maintainability metrics at a glance"
            },
            {
              icon: Sparkles,
              title: "AI-Powered Insights",
              description: "Machine learning models identify patterns and suggest improvements"
            }
          ].map((feature, i) => (
            <div key={i} className="group relative p-6 rounded-xl border border-border/40 bg-card/40 hover:bg-card/60 hover:border-primary/40 transition-all">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative space-y-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                  <feature.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="text-lg font-semibold">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section id="how" className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-20 border-t border-border/40">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">How it Works</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Three simple steps to test your code
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              step: "1",
              title: "Paste Your Repository",
              description: "Enter your GitHub repository URL and let our system analyze it"
            },
            {
              step: "2",
              title: "AI Analysis",
              description: "Our AI engine performs comprehensive checks across security, performance, and quality"
            },
            {
              step: "3",
              title: "Deploy Confidently",
              description: "Review detailed insights and deploy with full confidence"
            }
          ].map((item, i) => (
            <div key={i} className="relative">
              <div className="flex gap-4 items-start">
                <div className="flex-shrink-0">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary">
                    <span className="text-lg font-bold text-primary-foreground">{item.step}</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{item.title}</h3>
                  <p className="mt-2 text-muted-foreground">{item.description}</p>
                </div>
              </div>
              {i < 2 && (
                <div className="hidden md:block absolute top-6 -right-4 text-primary">
                  <ArrowRight className="w-8 h-8" />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-20 border-t border-border/40">
        <div className="bg-card/50 border border-border/40 rounded-2xl p-12">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <h2 className="text-4xl font-bold">Why Developers Love SandboxAI</h2>
              <div className="space-y-4">
                {[
                  "Catch bugs before they reach production",
                  "Save hours of manual testing",
                  "Continuous security monitoring",
                  "Instant, actionable insights",
                  "Integrates with your workflow"
                ].map((benefit, i) => (
                  <div key={i} className="flex gap-3 items-start">
                    <CheckCircle2 className="w-6 h-6 text-success flex-shrink-0 mt-0.5" />
                    <span className="text-lg text-foreground">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-success/20 to-primary/20 rounded-2xl blur-3xl" />
              <div className="relative bg-gradient-to-br from-card to-card/50 border border-border/40 rounded-xl p-8">
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-primary">98%</div>
                    <p className="text-muted-foreground mt-2">Issues caught before deployment</p>
                  </div>
                  <div className="h-px bg-border/40" />
                  <div className="text-center">
                    <div className="text-4xl font-bold text-secondary">10 min</div>
                    <p className="text-muted-foreground mt-2">Average analysis time</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-20 text-center border-t border-border/40">
        <h2 className="text-4xl font-bold mb-6">Ready to Deploy Confidently?</h2>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Start testing your repositories with AI-powered analysis today
        </p>
        <Link href="/app">
          <Button size="lg" className="gap-2">
            Launch SandboxAI <ArrowRight className="w-5 h-5" />
          </Button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-card/20 py-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                  <Code2 className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="font-bold">SandboxAI</span>
              </div>
              <p className="text-sm text-muted-foreground">Deploy with confidence</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition">Features</a></li>
                <li><a href="#" className="hover:text-foreground transition">Pricing</a></li>
                <li><a href="#" className="hover:text-foreground transition">Documentation</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition">About</a></li>
                <li><a href="#" className="hover:text-foreground transition">Blog</a></li>
                <li><a href="#" className="hover:text-foreground transition">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition">Privacy</a></li>
                <li><a href="#" className="hover:text-foreground transition">Terms</a></li>
                <li><a href="#" className="hover:text-foreground transition">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border/40 pt-8 flex justify-between items-center text-sm text-muted-foreground">
            <p>&copy; 2025 SandboxAI. All rights reserved.</p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-foreground transition">GitHub</a>
              <a href="#" className="hover:text-foreground transition">Twitter</a>
              <a href="#" className="hover:text-foreground transition">Discord</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
