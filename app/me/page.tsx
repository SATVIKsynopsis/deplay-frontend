"use client";

import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Code2,
  Calendar,
  ArrowLeft,
  LogOut,
  Github,
  ExternalLink,
  Clock,
  Hash,
} from "lucide-react";
import Link from "next/link";

interface User {
  avatarUrl: string;
  createdAt: string;
  githubId: number;
  lastLogin: string;
  provider: string;
  username: string;
}

function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
            <Skeleton className="h-32 w-32 rounded-full" />
            <div className="flex-1 space-y-4 text-center sm:text-left">
              <div className="space-y-2">
                <Skeleton className="h-8 w-48 mx-auto sm:mx-0" />
                <Skeleton className="h-5 w-32 mx-auto sm:mx-0" />
              </div>
              <div className="flex gap-4 justify-center sm:justify-start">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-24" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/me", {
          credentials: "include",
        });

        if (!res.ok) {
          if (res.status === 401) {
            window.location.href = "http://3.111.147.73:8080/auth/github";
            return;
          }
          throw new Error("Failed to fetch user data");
        }

        const data = await res.json();
        setUser(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleLogout = () => {
    window.location.href = "http://3.111.147.73:8080/logout";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getInitials = (username: string) => {
    return username.slice(0, 2).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-card/30">
      {/* Grid Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-10" />
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
            </Link>
            <Separator orientation="vertical" className="h-6" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Code2 className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg">Deplay</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2">
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {loading ? (
          <ProfileSkeleton />
        ) : error ? (
          <Card className="border-destructive/50 bg-destructive/10">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <p className="text-destructive">{error}</p>
                <Button onClick={() => window.location.reload()}>Try Again</Button>
              </div>
            </CardContent>
          </Card>
        ) : user ? (
          <div className="space-y-6">
            {/* Profile Header */}
            <Card className="border-border/40 bg-card/50 backdrop-blur-sm overflow-hidden">
              <div className="h-24 bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20" />
              <CardContent className="relative pt-0">
                <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-end -mt-16">
                  <Avatar className="h-32 w-32 border-4 border-background shadow-xl">
                    <AvatarImage src={user.avatarUrl} alt={user.username} />
                    <AvatarFallback className="text-2xl bg-gradient-to-br from-primary to-secondary text-primary-foreground">
                      {getInitials(user.username)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-center sm:text-left pb-2">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      <h1 className="text-2xl sm:text-3xl font-bold">{user.username}</h1>
                      <Badge variant="secondary" className="w-fit mx-auto sm:mx-0 capitalize">
                        <Github className="w-3 h-3 mr-1" />
                        {user.provider}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground text-lg">@{user.username}</p>
                  </div>
                  <a
                    href={`https://github.com/${user.username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hidden sm:block"
                  >
                    <Button variant="outline" className="gap-2">
                      <ExternalLink className="w-4 h-4" />
                      View on GitHub
                    </Button>
                  </a>
                </div>

                {/* Mobile GitHub Button */}
                <a
                  href={`https://github.com/${user.username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="sm:hidden mt-6 block"
                >
                  <Button variant="outline" className="w-full gap-2">
                    <ExternalLink className="w-4 h-4" />
                    View on GitHub
                  </Button>
                </a>
              </CardContent>
            </Card>

            {/* Account Info Card */}
            <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  Account Information
                </CardTitle>
                <CardDescription>Your account details and activity</CardDescription>
              </CardHeader>
              <CardContent className="grid sm:grid-cols-2 gap-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Hash className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">GitHub ID</p>
                    <p className="text-foreground font-mono">{user.githubId}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-secondary/10">
                    <Github className="w-4 h-4 text-secondary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Provider</p>
                    <p className="text-foreground capitalize">{user.provider}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Calendar className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Account Created</p>
                    <p className="text-foreground">{formatDate(user.createdAt)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-secondary/10">
                    <Clock className="w-4 h-4 text-secondary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Last Login</p>
                    <p className="text-foreground">{formatDateTime(user.lastLogin)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Navigate to other parts of the application</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  <Link href="/dashboard">
                    <Button className="gap-2">
                      <Code2 className="w-4 h-4" />
                      Go to Dashboard
                    </Button>
                  </Link>
                  <a href={`https://github.com/${user.username}`} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" className="gap-2">
                      <Github className="w-4 h-4" />
                      GitHub Profile
                    </Button>
                  </a>
                  <a
                    href={`https://github.com/${user.username}?tab=repositories`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" className="gap-2">
                      <ExternalLink className="w-4 h-4" />
                      Repositories
                    </Button>
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : null}
      </main>
    </div>
  );
}
