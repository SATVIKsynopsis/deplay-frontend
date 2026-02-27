"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, GitBranch, Zap, Code2, Terminal } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Home() {
  const [repoUrl, setRepoUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [runId, setRunId] = useState<string | null>(null);
  const [logs, setLogs] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<{
  summary: string;
  suggestions: string[];
} | null>(null);
const [status, setStatus] = useState<
  "RUNNING" | "READY" | "NOT_READY"
>("RUNNING");

  const runSandbox = async () => {
  setLoading(true);
  setError(null);
  setLogs("");
  setRunId(null);

  try {
    const res = await fetch("/api/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ repoUrl }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Something went wrong");
      setLoading(false);
      return;
    }

    setRunId(data.runId);

    const es = new EventSource(`/api/logs/${data.runId}`);

    es.onmessage = (event) => {
      setLogs((prev) => prev + event.data);
    };

    es.onerror = () => {
      es.close();
      setLoading(false);
    };
  } catch (err) {
    setError("Failed to reach backend");
    setLoading(false);
  }
};

useEffect(() => {
  if (!logs) return;

  setStatus("RUNNING");

  if (
    logs.includes("error") ||
    logs.includes("Error") ||
    logs.includes("failed")
  ) {
    setStatus("NOT_READY");
  }

  if (logs.includes("Docker build finished")) {
    setStatus("READY");
  }
}, [logs]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-card/40">
      {/* Background Grid Effect */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:2rem_2rem] opacity-5" />
      </div>

      <div className="relative mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-12 space-y-2 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 border border-primary/30">
              <Zap className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-foreground via-primary to-secondary bg-clip-text text-transparent">
              Deplik
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Pre-Deployment Sandbox – Test your repository before it goes live
          </p>
          <p className="text-sm text-muted-foreground/70">
            Analyze code quality, detect issues, and get AI-powered suggestions
          </p>
        </div>

        {/* Input Card */}
        <Card className="mb-8 border-primary/20 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GitBranch className="h-5 w-5 text-primary" />
              Repository URL
            </CardTitle>
            <CardDescription>
              Enter your GitHub repository URL to analyze
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3">
              <Input
                type="text"
                placeholder="https://github.com/user/repo"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                className="flex-1 bg-input border-border/50 focus:border-primary focus:ring-primary/30"
              />
              <Button
                onClick={runSandbox}
                disabled={loading || !repoUrl}
                className="px-8 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 transition-all duration-200"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded-full border-2 border-current border-r-transparent animate-spin" />
                    Running...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    Run Sandbox
                  </span>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Error State */}
        {error && (
          <Alert className="mb-8 border-destructive/50 bg-destructive/5">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <AlertDescription className="text-destructive">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Results Section */}
        {runId && (
          <div className="space-y-6">
            {/* Status Card */}
            <Card className="border-primary/20 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-accent" />
                    Sandbox Status
                  </CardTitle>
                  <Badge
                    variant={status === "READY" ? "default" : "secondary"}
                    className="capitalize"
                  >
                    {status}
                  </Badge>
                </div>
              </CardHeader>
            </Card>

            {/* AI Summary Card */}
            <Card className="border-secondary/20 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code2 className="h-5 w-5 text-secondary" />
                  AI Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {analysis?.summary || "The AI summary will appear here once the analysis is complete."}
                </p>
              </CardContent>
            </Card>

            {/* Suggestions Card */}
            <Card className="border-primary/20 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg">Suggested Fixes</CardTitle>
              </CardHeader>
             <CardContent>
  <ul className="space-y-3">
    {analysis ? (
      analysis.suggestions.map((suggestion, i) => (
        <li
          key={i}
          className="flex items-start gap-3 p-3 rounded-lg bg-muted/30"
        >
          <div className="mt-1 h-2 w-2 rounded-full bg-primary" />
          <span className="text-sm">{suggestion}</span>
        </li>
      ))
    ) : (
      <p className="text-sm text-muted-foreground">
        Suggestions will appear once analysis completes
      </p>
    )}
  </ul>
</CardContent>
            </Card>

            {/* Logs Card */}
            <Card className="border-muted/20 bg-card/50 backdrop-blur-sm overflow-hidden">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Terminal className="h-5 w-5 text-muted-foreground" />
                  Logs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-background/80 border border-border rounded-lg p-4 overflow-auto max-h-64 text-xs font-mono text-primary/80 whitespace-pre-wrap break-words">
{logs || "Waiting for logs..."}                </pre>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Empty State */}
        {!runId && !loading && !error && (
          <Card className="border-border/50 bg-card/30 backdrop-blur-sm text-center py-12">
            <CardContent className="space-y-4">
              <div className="flex justify-center">
                <div className="p-4 rounded-lg bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20">
                  <GitBranch className="h-8 w-8 text-primary/60" />
                </div>
              </div>
              <div>
                <p className="text-lg font-medium text-foreground/80">
                  Ready to analyze your repository
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Enter a GitHub repository URL and click Run Sandbox to get started
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
