"use client";

import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { RecentUrlsList } from "@/components/recent-urls-list";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth, useSocket, useToast } from "@/hooks";
import { createUrl, fetchRecentUrls } from "@/lib/api";

const urlSchema = z.object({
  longUrl: z.string().url("Please enter a valid URL"),
  customAlias: z.string().optional(),
});

type UrlFormValues = z.infer<typeof urlSchema>;

export default function CreateUrlPage() {
  const { toast } = useToast();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const socket = useSocket();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<UrlFormValues>({
    resolver: zodResolver(urlSchema),
    defaultValues: {
      longUrl: "",
      customAlias: "",
    },
  });

  const { data: recentUrls = [], isLoading } = useQuery({
    queryKey: ["recentUrls"],
    queryFn: fetchRecentUrls,
    enabled: isAuthenticated,
  });

  const createUrlMutation = useMutation({
    mutationFn: createUrl,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["urls"] });
      queryClient.invalidateQueries({ queryKey: ["recentUrls"] });
    },
  });

  async function onSubmit(data: UrlFormValues) {
    setIsSubmitting(true);
    try {
      await createUrlMutation.mutateAsync(data);

      toast({
        title: "URL created",
        description: "Your short URL has been created successfully.",
      });

      form.reset();

      // Emit socket event
      if (socket) {
        socket.emit("url:created", {
          longUrl: data.longUrl,
          timestamp: new Date().toISOString(),
        });
      }

      router.push("/urls");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create URL. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isAuthenticated) {
    router.push("/login");
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl py-8">
      <h1 className="mb-8 text-3xl font-bold">Create New URL</h1>

      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Shorten a URL</CardTitle>
            <CardDescription>
              Create a short, memorable link for your long URL
            </CardDescription>
          </CardHeader>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="longUrl">Long URL</Label>
                <Input
                  id="longUrl"
                  placeholder="https://example.com/very/long/url/that/needs/shortening"
                  {...form.register("longUrl")}
                />
                {form.formState.errors.longUrl && (
                  <p className="text-destructive text-sm">
                    {form.formState.errors.longUrl.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="customAlias">Custom Alias (Optional)</Label>
                <Input
                  id="customAlias"
                  placeholder="my-custom-link"
                  {...form.register("customAlias")}
                />
                {form.formState.errors.customAlias && (
                  <p className="text-destructive text-sm">
                    {form.formState.errors.customAlias.message}
                  </p>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Create Short URL
              </Button>
            </CardFooter>
          </form>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recently Created URLs</CardTitle>
            <CardDescription>
              Your 5 most recently created short URLs
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : recentUrls.length === 0 ? (
              <div className="flex h-64 flex-col items-center justify-center">
                <p className="text-muted-foreground mb-4">
                  You haven't created any URLs yet.
                </p>
              </div>
            ) : (
              <RecentUrlsList urls={recentUrls as URLItem[]} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
