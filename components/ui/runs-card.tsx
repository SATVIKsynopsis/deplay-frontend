"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  CheckCircle2,
  AlertCircle,
  Clock,
  Zap,
  Github,
  FileText,
  Sparkles,
  ExternalLink,
  Terminal,
  Lightbulb,
  AlertTriangle,
  Loader2,
  Download,
} from "lucide-react";
import Link from "next/link";

interface Run {
  runId: string;
  repoName: string;
  repoUrl: string;
  language: string;
  status: "RUNNING" | "READY" | "NOT_READY" | "FAILED" | "SUCCESS";
  createdAt: string;
  logsS3Key: string;
  analysisS3Key: string;
}

interface Analysis {
  issues: string[];
  suggestions: string[];
  summary: string;
}

const statusConfig = {
  READY: { color: "bg-green-500/10 text-green-700 dark:text-green-400", icon: CheckCircle2, label: "Ready" },
  SUCCESS: { color: "bg-green-500/10 text-green-700 dark:text-green-400", icon: CheckCircle2, label: "Success" },
  RUNNING: { color: "bg-blue-500/10 text-blue-700 dark:text-blue-400", icon: Clock, label: "Running" },
  NOT_READY: { color: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400", icon: AlertCircle, label: "Not Ready" },
  FAILED: { color: "bg-red-500/10 text-red-700 dark:text-red-400", icon: AlertCircle, label: "Failed" },
};

const languageColors: Record<string, string> = {
  javascript: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  typescript: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  python: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  rust: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
  java: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  csharp: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  go: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300",
  default: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300",
};

// Logs Dialog Component
function LogsDialog({ runId, repoName }: { runId: string; repoName: string }) {
  const [logs, setLogs] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/logs/${runId}`);
      if (!response.ok) throw new Error("Failed to fetch logs");
      const text = await response.text();
      setLogs(text);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchLogs();
    }
  }, [open, runId]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 gap-2">
          <Terminal className="h-4 w-4" />
          <span>Logs</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Terminal className="h-5 w-5 text-primary" />
            Build Logs
          </DialogTitle>
          <DialogDescription>
            Logs for {repoName} • Run ID: {runId.substring(0, 8)}...
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 min-h-0 mt-4">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-64 text-destructive">
              <AlertCircle className="h-8 w-8 mb-2" />
              <p>{error}</p>
            </div>
          ) : (
            <ScrollArea className="h-[50vh] rounded-lg border border-border/50 bg-black/90">
              <pre className="p-4 text-sm font-mono text-green-400 whitespace-pre-wrap break-words">
                {logs || "No logs available"}
              </pre>
            </ScrollArea>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Analysis Dialog Component
function AnalysisDialog({ runId, repoName, repoUrl, language, status }: { runId: string; repoName: string; repoUrl?: string; language?: string; status?: string }) {
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const fetchAnalysis = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/analysis/${runId}`);
      if (!response.ok) throw new Error("Failed to fetch analysis");
      const data = await response.json();
      setAnalysis(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load analysis");
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = () => {
    if (!analysis) return;

    const report = {
      timestamp: new Date().toISOString(),
      runId: runId,
      repository: repoUrl || repoName,
      repoName: repoName,
      language: language || "Unknown",
      status: status || "Unknown",
      summary: analysis.summary,
      issues: analysis.issues || [],
      suggestions: analysis.suggestions || [],
      totalIssues: analysis.issues?.length || 0,
      totalSuggestions: analysis.suggestions?.length || 0,
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `deplik-report-${repoName}-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    if (open) {
      fetchAnalysis();
    }
  }, [open, runId]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 gap-2">
          <Sparkles className="h-4 w-4" />
          <span>Analysis</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              AI Analysis Report
            </div>
            {analysis && (
              <Button
                variant="outline"
                size="sm"
                onClick={downloadReport}
                className="h-8 px-3 text-xs gap-1.5 hover:bg-primary/10"
              >
                <Download className="h-3.5 w-3.5" />
                Export
              </Button>
            )}
          </DialogTitle>
          <DialogDescription>
            Analysis for {repoName} • Run ID: {runId.substring(0, 8)}...
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 min-h-0 mt-4 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-64 text-destructive">
              <AlertCircle className="h-8 w-8 mb-2" />
              <p>{error}</p>
            </div>
          ) : analysis ? (
            <ScrollArea className="h-[60vh] pr-4">
              <div className="space-y-6">
                {/* Summary Section */}
                <Card className="border-primary/20 bg-primary/5">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary" />
                      Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {analysis.summary}
                    </p>
                  </CardContent>
                </Card>

                {/* Issues Section */}
                {analysis.issues && analysis.issues.length > 0 && (
                  <Card className="border-yellow-500/20 bg-yellow-500/5">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                        Issues Found
                        <Badge variant="secondary" className="ml-2 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                          {analysis.issues.length}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {analysis.issues.map((issue, index) => (
                          <li key={index} className="flex gap-3 text-sm">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 flex items-center justify-center text-xs font-medium">
                              {index + 1}
                            </span>
                            <span className="text-muted-foreground leading-relaxed pt-0.5">
                              {issue}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* Suggestions Section */}
                {analysis.suggestions && analysis.suggestions.length > 0 && (
                  <Card className="border-green-500/20 bg-green-500/5">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Lightbulb className="h-4 w-4 text-green-600 dark:text-green-400" />
                        Suggestions
                        <Badge variant="secondary" className="ml-2 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                          {analysis.suggestions.length}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {analysis.suggestions.map((suggestion, index) => (
                          <li key={index} className="flex gap-3 text-sm">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500/20 text-green-700 dark:text-green-400 flex items-center justify-center text-xs font-medium">
                              {index + 1}
                            </span>
                            <span className="text-muted-foreground leading-relaxed pt-0.5">
                              {suggestion}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </div>
            </ScrollArea>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
              <Sparkles className="h-8 w-8 mb-2 opacity-50" />
              <p>No analysis available</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function RunSkeleton() {
  return (
    <Card className="border-border/40 bg-card/50 backdrop-blur-sm hover:border-border/60 transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-6 w-20" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex gap-2">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-24" />
          </div>
          <Skeleton className="h-4 w-40" />
        </div>
      </CardContent>
    </Card>
  );
}

function RunCard({ run }: { run: Run }) {
  const statusInfo = statusConfig[run.status] || statusConfig.NOT_READY;
  const StatusIcon = statusInfo.icon;
  const languageColor =
    languageColors[run.language?.toLowerCase()] || languageColors.default;
  
  const formattedDate = new Date(run.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Card className="border-border/40 bg-card/50 backdrop-blur-sm hover:border-border/60 transition-all hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Github className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-lg truncate">{run.repoName}</CardTitle>
            </div>
            <CardDescription className="truncate text-xs">
              {run.repoUrl}
            </CardDescription>
          </div>
          <Badge className={`${statusInfo.color} border-0 whitespace-nowrap flex items-center gap-1`}>
            <StatusIcon className="h-3 w-3" />
            {statusInfo.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Separator className="bg-border/30" />
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className={languageColor}>
            {run.language || "Unknown"}
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Zap className="h-3 w-3" />
            Run ID: {run.runId.substring(0, 8)}
          </Badge>
        </div>
        
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>{formattedDate}</span>
        </div>

        <div className="flex gap-2 pt-2">
          {run.logsS3Key && (
            <LogsDialog runId={run.runId} repoName={run.repoName} />
          )}
          {run.analysisS3Key && (
            <AnalysisDialog 
              runId={run.runId} 
              repoName={run.repoName} 
              repoUrl={run.repoUrl}
              language={run.language}
              status={run.status}
            />
          )}
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="h-8 gap-2 ml-auto"
          >
            <a href={run.repoUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" />
              <span>Repo</span>
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function RunsSection() {
  const [runs, setRuns] = useState<Run[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRuns = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/runs");
        
        if (!response.ok) {
          throw new Error("Failed to fetch runs");
        }
        
        const data = await response.json();
        setRuns(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        setRuns([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRuns();
  }, []);

  if (loading) {
    return (
      <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Analysis Runs</CardTitle>
          <CardDescription>
            View your code analysis history
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <RunSkeleton key={i} />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive/50 bg-destructive/5">
        <CardHeader>
          <CardTitle className="text-destructive flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Error Loading Runs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>Analysis Runs</CardTitle>
        <CardDescription>
          {runs.length === 0
            ? "No runs yet. Start by analyzing a repository."
            : `You have ${runs.length} run${runs.length !== 1 ? "s" : ""}`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {runs.length === 0 ? (
          <div className="text-center py-8">
            <Zap className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
            <p className="text-muted-foreground">No analysis runs yet</p>
            <Button asChild className="mt-4">
              <Link href="/dashboard">Start Analysis</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {runs.map((run) => (
              <RunCard key={run.runId} run={run} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
