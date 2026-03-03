"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle2,
  AlertCircle,
  Clock,
  Zap,
  Github,
  FileText,
  Download,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";

interface Run {
  runId: string;
  repoName: string;
  repoUrl: string;
  language: string;
  status: "RUNNING" | "READY" | "NOT_READY" | "FAILED";
  createdAt: string;
  logsS3Key: string;
  analysisS3Key: string;
}

const statusConfig = {
  READY: { color: "bg-green-500/10 text-green-700 dark:text-green-400", icon: CheckCircle2, label: "Ready" },
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
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="h-8 gap-2"
            >
              <Link href={`/api/logs/${run.runId}`}>
                <FileText className="h-4 w-4" />
                <span>Logs</span>
              </Link>
            </Button>
          )}
          {run.analysisS3Key && (
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="h-8 gap-2"
            >
              <Link href={`/api/analysis/${run.runId}`}>
                <Download className="h-4 w-4" />
                <span>Analysis</span>
              </Link>
            </Button>
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
