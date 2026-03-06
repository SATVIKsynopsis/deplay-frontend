"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, GitBranch, Zap, Code2, Terminal, Sparkles, ListChecks, User, Link as LinkIcon, Download, Clock, Circle, Loader2, Shield, ShieldAlert, ShieldX, Rocket, FileCode, RefreshCw } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import { ThemeToggle } from "@/components/theme-toggle";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Home() {
  const [repoUrl, setRepoUrl] = useState("");
  const [language, setLanguage] = useState("");
  const [loading, setLoading] = useState(false);
  const [runId, setRunId] = useState<string | null>(null);
  const [logs, setLogs] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [inputMode, setInputMode] = useState<"paste" | "github">("paste");
  const [repos, setRepos] = useState<Array<{ id: number; full_name: string; html_url: string; language: string | null; private: boolean }>>([]);
  const [reposLoading, setReposLoading] = useState(false);
  const [reposError, setReposError] = useState<string | null>(null);
  const [selectedRepo, setSelectedRepo] = useState<string>("");
  const [analysis, setAnalysis] = useState<{
  summary: string;
  suggestions: string[];
} | null>(null);
const [status, setStatus] = useState<
  "RUNNING" | "READY" | "NOT_READY"
>("RUNNING");
const [analysisLoading, setAnalysisLoading] = useState(false);
const [analysisError, setAnalysisError] = useState<string | null>(null);
const [elapsedTime, setElapsedTime] = useState(0);
const eventSourceRef = useRef<EventSource | null>(null);
const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
const logQueueRef = useRef<string[]>([]);
const logTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
const logsContainerRef = useRef<HTMLPreElement | null>(null);

const stopLogPump = () => {
  if (logTimerRef.current) {
    clearTimeout(logTimerRef.current);
    logTimerRef.current = null;
  }
};

const pumpQueuedLogs = () => {
  if (logQueueRef.current.length === 0) {
    logTimerRef.current = null;
    return;
  }

  const nextLine = logQueueRef.current.shift();

  if (nextLine !== undefined) {
    setLogs((prev) => `${prev}> ${nextLine}\n`);
  }

  logTimerRef.current = setTimeout(pumpQueuedLogs, 90);
};

const enqueueLogChunk = (chunk: string) => {
  const lines = chunk
    .split(/\r?\n/)
    .map((line) => line.trimEnd())
    .filter((line) => line && line !== "connected" && line !== "keep-alive");

  if (lines.length === 0) {
    return;
  }

  logQueueRef.current.push(...lines);

  if (!logTimerRef.current) {
    pumpQueuedLogs();
  }
};

const fetchRepos = async () => {
  setReposLoading(true);
  setReposError(null);
  try {
    const res = await fetch("/api/repos", {
      credentials: "include",
    });
    if (!res.ok) {
      if (res.status === 401) {
        setReposError("Please login to view your repositories");
        return;
      }
      throw new Error("Failed to fetch repos");
    }
    const data = await res.json();
    setRepos(data);
  } catch (err) {
    setReposError(err instanceof Error ? err.message : "Failed to fetch repos");
  } finally {
    setReposLoading(false);
  }
};

useEffect(() => {
  if (inputMode === "github" && repos.length === 0 && !reposLoading) {
    fetchRepos();
  }
}, [inputMode]);

const handleRepoSelect = (repoFullName: string) => {
  setSelectedRepo(repoFullName);
  const repo = repos.find((r) => r.full_name === repoFullName);
  if (repo) {
    setRepoUrl(repo.html_url);
    // Auto-detect language if available
    if (repo.language) {
      const langMap: Record<string, string> = {
        JavaScript: "javascript",
        TypeScript: "javascript",
        Python: "python",
        Rust: "rust",
        Java: "java",
        C: "c",
        "C++": "cpp",
      };
      const mappedLang = langMap[repo.language];
      if (mappedLang) {
        setLanguage(mappedLang);
      }
    }
  }
};

  const runSandbox = async () => {
  eventSourceRef.current?.close();
  stopLogPump();
  logQueueRef.current = [];
  setLoading(true);
  setError(null);
  setLogs("");
  setRunId(null);
  setStatus("RUNNING");
  setAnalysis(null);
  setAnalysisError(null);
  setAnalysisLoading(false);

  try {
    const res = await fetch("/api/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ repoUrl, language }),
    });

    const data = await res.json();

    if (!res.ok) {
      if (typeof data.error === "string" && data.error.startsWith("<!DOCTYPE")) {
        setError("Network policy blocked GitHub access. Try a different network.");
      } else {
        setError(data.error || "Something went wrong");
      }
      setLoading(false);
      return;
    }

    const newRunId = data.runId;
    setRunId(newRunId);

    const es = new EventSource(`/api/logs/${newRunId}`);

    eventSourceRef.current = es;

    es.onmessage = (event) => {
      const data = event.data;

      if (data === "connected" || data === "keep-alive") return;

      if (data.startsWith("<!DOCTYPE html")) {
        console.error("Blocked HTML response detected");
        return;
      }

      enqueueLogChunk(data);
    };

    es.onerror = () => {
      es.close();
      eventSourceRef.current = null;
      setLoading(false);
    };
  } catch (err) {
    setError("Failed to reach backend");
    setLoading(false);
  }
};

useEffect(() => {
  if (logsContainerRef.current) {
    logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight;
  }
}, [logs]);

useEffect(() => {
  if (!logs) return;

  const logsLower = logs.toLowerCase();

  // Only mark as NOT_READY for actual build failures, not just any "error" word
  if (
    logsLower.includes("docker build failed") ||
    logsLower.includes("build failed") ||
    logsLower.includes("fatal error") ||
    logsLower.includes("error: ") ||
    logsLower.includes("npm err!") ||
    logsLower.includes("pip error")
  ) {
    setStatus("NOT_READY");
    return;
  }

  if (logsLower.includes("docker build finished")) {
    setStatus("READY");
    return;
  }

  setStatus("RUNNING");
}, [logs]);

useEffect(() => {
  if (status === "READY" || status === "NOT_READY") {
    setLoading(false);
    eventSourceRef.current?.close();
    eventSourceRef.current = null;
  }
}, [status]);

useEffect(() => {
  return () => {
    eventSourceRef.current?.close();
    stopLogPump();
  };
}, []);

useEffect(() => {
  if (status !== "READY" || !runId) return;

  let cancelled = false;
  setAnalysisLoading(true);
  setAnalysisError(null);

  const poll = async () => {
    if (cancelled) return;

    try {
      const res = await fetch(`/api/analysis/${runId}`, {
        cache: "no-store",
      });

      if (res.status === 404) {
        setTimeout(poll, 1500);
        return;
      }

      if (!res.ok) {
        throw new Error("analysis failed");
      }

      const data = await res.json();
      setAnalysis(data);
      setAnalysisLoading(false);
    } catch {
      setAnalysisError("Failed to fetch AI analysis.");
      setAnalysisLoading(false);
    }
  };

  poll();

  return () => {
    cancelled = true;
  };
}, [status, runId]);

const getSuggestionSeverity = (suggestion: string) => {
  const text = suggestion.toLowerCase();

  if (
    text.includes("vulnerab") ||
    text.includes("security") ||
    text.includes("critical") ||
    text.includes("failed") ||
    text.includes("error")
  ) {
    return "high";
  }

  if (
    text.includes("warning") ||
    text.includes("optimiz") ||
    text.includes("update") ||
    text.includes("improve")
  ) {
    return "medium";
  }

  return "low";
};

const getCommandHint = (suggestion: string) => {
  const inlineCodeMatch = suggestion.match(/`([^`]+)`/);

  if (inlineCodeMatch?.[1]) {
    return inlineCodeMatch[1];
  }

  const commandMatch = suggestion.match(
    /\b(npm|pnpm|yarn|cargo|pip|poetry|docker|git|node|python)\b[^.;\n]*/i
  );

  return commandMatch?.[0]?.trim() || null;
};

const shortenedRunId = runId
  ? `${runId.slice(0, 8)}...${runId.slice(-4)}`
  : "-";
const dockerBuildFailed = logs.toLowerCase().includes("docker build failed");
const dockerBuildFinished = logs.toLowerCase().includes("docker build finished");

// Timeline steps based on log events - sequential logic
const timelineSteps = useMemo(() => {
  const logsLower = logs.toLowerCase();
  
  // Check each step completion in order
  const step1Done = logsLower.includes("cloning") || logsLower.includes("cloned");
  const step2Done = step1Done && logsLower.includes("dockerfile");
  const step3Done = step2Done && (
    logsLower.includes("downloaded") || 
    logsLower.includes("installed") || 
    logsLower.includes("compiling") ||
    logsLower.includes("building")
  );
  const step4Done = step3Done && dockerBuildFinished;
  const step5Done = step4Done && analysis !== null;

  // Determine what's currently in progress
  const step1InProgress = loading && !step1Done;
  const step2InProgress = loading && step1Done && !step2Done;
  const step3InProgress = loading && step2Done && !step4Done && !dockerBuildFailed;
  const step4InProgress = false; // Docker build shows as step 3 progress until finished
  const step5InProgress = (status === "READY" || dockerBuildFinished) && analysisLoading && !analysis;

  return [
    { id: 1, label: "Repository cloned", completed: step1Done, inProgress: step1InProgress },
    { id: 2, label: "Dockerfile generated", completed: step2Done, inProgress: step2InProgress },
    { id: 3, label: "Dependencies installed", completed: step3Done, inProgress: step3InProgress },
    { id: 4, label: "Docker build completed", completed: step4Done, inProgress: step4InProgress },
    { id: 5, label: "AI analysis", completed: step5Done, inProgress: step5InProgress },
  ];
}, [logs, loading, status, analysis, analysisLoading, dockerBuildFinished, dockerBuildFailed]);

// Deployment status based on analysis - only show when not loading
const deploymentStatus = useMemo(() => {
  // Don't show deployment status while still loading
  if (loading) return null;
  
  // Only show failed if docker build explicitly failed
  if (dockerBuildFailed) {
    return { status: "failed", label: "Build Failed", color: "bg-red-500/10 text-red-600 border-red-500/30", icon: ShieldX };
  }
  
  // Only show status after we have analysis
  if (analysis) {
    const hasVulnerabilities = analysis.suggestions.some(s => 
      s.toLowerCase().includes("vulnerab") || 
      s.toLowerCase().includes("security") ||
      s.toLowerCase().includes("critical")
    );
    const hasWarnings = analysis.suggestions.some(s =>
      s.toLowerCase().includes("warning") ||
      s.toLowerCase().includes("error") ||
      s.toLowerCase().includes("failed")
    );

    if (hasVulnerabilities) {
      return { status: "warning", label: "Needs Attention", color: "bg-amber-500/10 text-amber-600 border-amber-500/30", icon: ShieldAlert };
    }
    if (hasWarnings) {
      return { status: "warning", label: "Needs Attention", color: "bg-amber-500/10 text-amber-600 border-amber-500/30", icon: ShieldAlert };
    }
    return { status: "ready", label: "Ready for Deployment", color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30", icon: Shield };
  }

  return null;
}, [analysis, dockerBuildFailed, loading]);

// Download report function
const downloadReport = () => {
  if (!analysis || !runId) return;

  const date = new Date().toISOString();
  const formattedDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const markdown = `# Deplik Analysis Report

**Generated:** ${formattedDate}

---

## Repository Information

| Field | Value |
|-------|-------|
| **Repository** | ${repoUrl} |
| **Language** | ${language} |
| **Run ID** | \`${runId}\` |
| **Status** | ${status} |
| **Deployment Status** | ${deploymentStatus?.label || "Unknown"} |

---

## AI Summary

${analysis.summary}

---

## Suggestions (${analysis.suggestions.length})

${analysis.suggestions.length > 0 
    ? analysis.suggestions.map((s, i) => `### ${i + 1}. Suggestion\n\n${s}`).join("\n\n")
    : "*No suggestions generated for this run.*"
  }

---

*Report generated by [Deplik](https://deplik.app) - Pre-Deployment Sandbox*
`;

  const blob = new Blob([markdown], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `deplik-report-${new Date().toISOString().split("T")[0]}.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// Timer effect for elapsed time
useEffect(() => {
  if (loading) {
    setElapsedTime(0);
    timerRef.current = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);
  } else {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }

  return () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };
}, [loading]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-card/40">
      {/* Background Grid Effect */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:2rem_2rem] opacity-5" />
      </div>

      {/* Theme Toggle & Profile - Fixed Position */}
      <div className="fixed top-6 right-6 z-50 flex items-center gap-2">
        <ThemeToggle />
        <Link href="/me">
          <Button variant="outline" size="icon" className="rounded-full">
            <User className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      <div className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
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
              Repository
            </CardTitle>
            <CardDescription>
              Select a repository from your GitHub account or paste a URL
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Tabs value={inputMode} onValueChange={(v) => setInputMode(v as "paste" | "github")} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="paste" className="gap-2">
                  <LinkIcon className="h-4 w-4" />
                  Paste URL
                </TabsTrigger>
                <TabsTrigger value="github" className="gap-2">
                  <GitBranch className="h-4 w-4" />
                  My Repositories
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {inputMode === "paste" ? (
              <div className="grid gap-3 sm:grid-cols-[1fr_180px_auto]">
                <Input
                  type="text"
                  placeholder="https://github.com/user/repo"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  className="flex-1 bg-input border-border/50 focus:border-primary focus:ring-primary/30"
                />
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="w-full bg-input border-border/50 focus:border-primary focus:ring-primary/30">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="javascript">JavaScript</SelectItem>
                    <SelectItem value="python">Python</SelectItem>
                    <SelectItem value="rust">Rust</SelectItem>
                    <SelectItem value="java">Java</SelectItem>
                    <SelectItem value="c">C</SelectItem>
                    <SelectItem value="cpp">C++</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  onClick={runSandbox}
                  disabled={loading || !repoUrl || !language}
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
            ) : (
              <div className="space-y-4">
                {reposLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Spinner className="h-6 w-6" />
                    <span className="ml-2 text-muted-foreground">Loading your repositories...</span>
                  </div>
                ) : reposError ? (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{reposError}</AlertDescription>
                  </Alert>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-[1fr_180px_auto]">
                    <Select value={selectedRepo} onValueChange={handleRepoSelect}>
                      <SelectTrigger className="w-full bg-input border-border/50 focus:border-primary focus:ring-primary/30">
                        <SelectValue placeholder="Select a repository" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px]">
                        {repos.map((repo) => (
                          <SelectItem key={repo.id} value={repo.full_name}>
                            <span className="flex items-center gap-2">
                              {repo.full_name}
                              {repo.private && (
                                <Badge variant="secondary" className="text-xs">
                                  Private
                                </Badge>
                              )}
                              {repo.language && (
                                <Badge variant="outline" className="text-xs">
                                  {repo.language}
                                </Badge>
                              )}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={language} onValueChange={setLanguage}>
                      <SelectTrigger className="w-full bg-input border-border/50 focus:border-primary focus:ring-primary/30">
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="javascript">JavaScript</SelectItem>
                        <SelectItem value="python">Python</SelectItem>
                        <SelectItem value="rust">Rust</SelectItem>
                        <SelectItem value="java">Java</SelectItem>
                        <SelectItem value="c">C</SelectItem>
                        <SelectItem value="cpp">C++</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      onClick={runSandbox}
                      disabled={loading || !repoUrl || !language}
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
                )}
              </div>
            )}
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
        {(runId || loading) && (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)] lg:items-start">
            <div className="space-y-6">
              {/* Status Card with Timeline */}
              <Card className="border-primary/20 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Rocket className="h-5 w-5 text-primary" />
                      Sandbox Execution
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      {loading && (
                        <Badge variant="outline" className="gap-1.5 font-mono text-xs">
                          <Clock className="h-3 w-3" />
                          {Math.floor(elapsedTime / 60)}:{String(elapsedTime % 60).padStart(2, "0")}
                        </Badge>
                      )}
                      <Badge
                        variant={status === "READY" ? "default" : "secondary"}
                        className="capitalize"
                      >
                        {status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Loading Progress State */}
                  {loading && (
                    <div className="mb-4 p-4 rounded-lg bg-primary/5 border border-primary/20">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="h-8 w-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
                          <Zap className="h-3 w-3 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">Running sandbox...</p>
                          <p className="text-xs text-muted-foreground">This may take ~30 seconds</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Execution Timeline */}
                  <div className="space-y-3">
                    {timelineSteps.map((step, index) => (
                      <div key={step.id} className="flex items-center gap-3">
                        <div className="relative flex items-center justify-center">
                          {step.completed ? (
                            <div className="h-6 w-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
                              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                            </div>
                          ) : step.inProgress ? (
                            <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center">
                              <Loader2 className="h-4 w-4 text-primary animate-spin" />
                            </div>
                          ) : (
                            <div className="h-6 w-6 rounded-full bg-muted/50 border border-border flex items-center justify-center">
                              <Circle className="h-3 w-3 text-muted-foreground/50" />
                            </div>
                          )}
                          {index < timelineSteps.length - 1 && (
                            <div className={`absolute top-6 left-1/2 -translate-x-1/2 w-0.5 h-4 ${
                              step.completed ? "bg-emerald-500/30" : "bg-border"
                            }`} />
                          )}
                        </div>
                        <span className={`text-sm ${
                          step.completed 
                            ? "text-foreground font-medium" 
                            : step.inProgress 
                              ? "text-primary font-medium" 
                              : "text-muted-foreground"
                        }`}>
                          {step.label}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Deployment Status Badge + Run Again */}
                  {deploymentStatus && !loading && (
                    <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between gap-3">
                      <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border ${deploymentStatus.color}`}>
                        <deploymentStatus.icon className="h-4 w-4" />
                        <span className="text-sm font-medium">{deploymentStatus.label}</span>
                      </div>
                      <Button
                        onClick={runSandbox}
                        disabled={loading || !repoUrl || !language}
                        variant="outline"
                        size="sm"
                        className="gap-2 hover:bg-primary/10 hover:border-primary/50"
                      >
                        <RefreshCw className="h-4 w-4" />
                        Run Again
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {dockerBuildFailed && !loading && (
                <Alert className="border-destructive/50 bg-destructive/10">
                  <AlertCircle className="h-4 w-4 text-destructive" />
                  <AlertDescription className="text-destructive">
                    Docker build failed. Check the logs below for the failing step and fix suggestion.
                  </AlertDescription>
                </Alert>
              )}


              {/* Logs Card */}
              <Card className="border-muted/20 bg-card/50 backdrop-blur-sm overflow-hidden">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Terminal className="h-5 w-5 text-muted-foreground" />
                    Logs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <pre ref={logsContainerRef} className="ui-scrollbar bg-background/80 border border-border rounded-lg p-4 overflow-auto max-h-64 text-xs font-mono text-primary/80 whitespace-pre-wrap break-words">
                    {logs || "> Waiting for logs..."}
                  </pre>
                </CardContent>
              </Card>
            </div>

            {/* AI Summary Card - Right Side */}
            <aside className="relative lg:sticky lg:top-24">
              <div className="pointer-events-none absolute -inset-[1px] rounded-xl bg-gradient-to-br from-secondary/50 via-primary/20 to-secondary/50 opacity-70 blur-sm animate-pulse" />
              <Card className="relative border-secondary/30 bg-card/70 backdrop-blur-md shadow-lg transition-transform duration-300 hover:-translate-y-1 lg:h-[28rem] lg:overflow-hidden">
                <CardHeader>
                  <div className="flex items-center justify-between gap-4">
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-secondary" />
                      AI Analysis
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      {analysis && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={downloadReport}
                          className="h-7 px-2 text-xs gap-1.5 hover:bg-secondary/10"
                        >
                          <Download className="h-3.5 w-3.5" />
                          Export
                        </Button>
                      )}
                      <Badge variant="secondary" className="gap-1">
                        <ListChecks className="h-3.5 w-3.5" />
                        {analysis?.suggestions?.length ?? 0} suggestions
                      </Badge>
                    </div>
                  </div>
                  <CardDescription>
                    Actionable insights generated from sandbox execution logs
                  </CardDescription>
                </CardHeader>
                <CardContent className="ui-scrollbar space-y-5 lg:h-[calc(28rem-7.25rem)] lg:overflow-y-auto pr-2">
                  {analysisLoading ? (
                    <div className="space-y-4">
                      <div className="flex flex-col items-center justify-center p-6 rounded-lg border border-secondary/30 bg-gradient-to-br from-secondary/5 to-primary/5">
                        <div className="relative mb-4">
                          <div className="h-12 w-12 rounded-full border-2 border-secondary/30 border-t-secondary animate-spin" />
                          <Sparkles className="h-5 w-5 text-secondary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                        </div>
                        <p className="text-sm font-medium text-foreground">Generating AI Analysis</p>
                        <p className="text-xs text-muted-foreground mt-1">Analyzing build logs and dependencies...</p>
                      </div>
                    </div>
                  ) : analysisError ? (
                    <Alert className="border-destructive/40 bg-destructive/5">
                      <AlertCircle className="h-4 w-4 text-destructive" />
                      <AlertDescription className="text-destructive">
                        {analysisError}
                      </AlertDescription>
                    </Alert>
                  ) : analysis ? (
                    <>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="rounded-lg border border-border/60 bg-background/60 p-3">
                          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Run</p>
                          <p className="mt-1 font-mono text-xs text-foreground/90">{shortenedRunId}</p>
                        </div>
                        <div className="rounded-lg border border-border/60 bg-background/60 p-3">
                          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Status</p>
                          <p className="mt-1 font-mono text-xs text-foreground/90">{status}</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h3 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                          Developer Summary
                        </h3>
                        <p className="rounded-lg border border-border/60 bg-background/60 p-3 font-mono text-xs leading-relaxed text-foreground/90">
                          {analysis.summary}
                        </p>
                      </div>

                      <div className="space-y-3">
                        <h3 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                          Actionable Fixes
                        </h3>
                        {analysis.suggestions.length > 0 ? (
                          <ul className="space-y-3">
                            {analysis.suggestions.map((suggestion, i) => {
                              const severity = getSuggestionSeverity(suggestion);
                              const commandHint = getCommandHint(suggestion);

                              return (
                                <li
                                  key={i}
                                  className="rounded-lg border border-border/60 bg-background/60 p-3"
                                >
                                  <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="min-w-6 justify-center px-1.5">
                                      {i + 1}
                                    </Badge>
                                    <Badge
                                      variant="outline"
                                      className={
                                        severity === "high"
                                          ? "border-destructive/60 text-destructive"
                                          : severity === "medium"
                                            ? "border-amber-500/60 text-amber-500"
                                            : "border-emerald-500/60 text-emerald-500"
                                      }
                                    >
                                      {severity}
                                    </Badge>
                                  </div>
                                  <p className="mt-2 text-sm leading-relaxed text-foreground/90">
                                    {suggestion}
                                  </p>
                                  {commandHint && (
                                    <div className="mt-2 rounded-md border border-border/70 bg-muted/30 px-2 py-1 font-mono text-xs text-primary/90">
                                      $ {commandHint}
                                    </div>
                                  )}
                                </li>
                              );
                            })}
                          </ul>
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            No suggestions were generated for this run.
                          </p>
                        )}
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      The AI analysis will appear once the sandbox is ready.
                    </p>
                  )}
                </CardContent>
              </Card>
            </aside>
          </div>
        )}

        {/* Empty State */}
        {!runId && !loading && !error && (
          <Card className="border-border/50 bg-card/30 backdrop-blur-sm text-center py-16">
            <CardContent className="space-y-6">
              <div className="flex justify-center">
                <div className="relative">
                  <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 blur-xl animate-pulse" />
                  <div className="relative p-5 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20">
                    <FileCode className="h-10 w-10 text-primary" />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-foreground">
                  No runs yet
                </h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                  Run your first sandbox to analyze a repository. We&apos;ll build it in an isolated Docker container and provide AI-powered insights.
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Secure sandbox environment
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                  Real-time build logs
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="h-1.5 w-1.5 rounded-full bg-purple-500" />
                  AI-powered analysis
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
