"use client";

import { use, useEffect, useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { Loader2, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UrlList } from "@/components/url-list";
import { UrlStatsModal } from "@/components/url-stats-modal";
import { useAuth, useToast } from "@/hooks";
import { deleteUrl, fetchUrls } from "@/lib/api";

export default function UrlsPage() {
  const { toast } = useToast();
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [selectedUrl, setSelectedUrl] = useState<URLItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  console.log("user", user, isAuthenticated);

  const {
    data: urls = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["urls"],
    queryFn: () => fetchUrls(),
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (!isAuthenticated && !authLoading) {
      router.push("/login");
    }
  }, [isAuthenticated]);

  const filteredUrls = urls.filter(
    (url: URLItem) =>
      url.longUrl.toLowerCase().includes(searchTerm.toLowerCase()) ||
      url.shortUrl?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeUrls = filteredUrls.filter(
    (url: URLItem) => url.status === "active"
  );
  const archivedUrls = filteredUrls.filter(
    (url: URLItem) => url.status === "archived"
  );

  const handleViewStats = (url: URLItem) => {
    setSelectedUrl(url);
    setIsModalOpen(true);
  };

  const handleDeleteUrl = async (id: string) => {
    try {
      await deleteUrl(id);
      refetch();
      toast({
        title: "URL deleted",
        description: "The URL has been deleted successfully.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete URL. Please try again.",
      });
    }
  };

  if (!isAuthenticated || authLoading) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Your URLs</h1>
        <Button asChild>
          <Link href="/create-url">
            <Plus className="mr-2 h-4 w-4" />
            Create New URL
          </Link>
        </Button>
      </div>

      <div className="mb-6">
        <Label htmlFor="search" className="sr-only">
          Search URLs
        </Label>
        <Input
          id="search"
          placeholder="Search URLs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="active">Active URLs</TabsTrigger>
            <TabsTrigger value="archived">Archived URLs</TabsTrigger>
          </TabsList>

          <TabsContent value="active">
            {activeUrls.length === 0 ? (
              <Card>
                <CardContent className="flex h-64 flex-col items-center justify-center">
                  <p className="text-muted-foreground mb-4">
                    You don't have any active URLs yet.
                  </p>
                  <Button asChild>
                    <Link href="/create-url">Create Your First URL</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <UrlList
                urls={activeUrls}
                onViewStats={handleViewStats}
                onDelete={handleDeleteUrl}
              />
            )}
          </TabsContent>

          <TabsContent value="archived">
            {archivedUrls.length === 0 ? (
              <Card>
                <CardContent className="flex h-64 flex-col items-center justify-center">
                  <p className="text-muted-foreground">
                    You don't have any archived URLs.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <UrlList
                urls={archivedUrls}
                onViewStats={handleViewStats}
                onDelete={handleDeleteUrl}
              />
            )}
          </TabsContent>
        </Tabs>
      )}

      {selectedUrl && (
        <UrlStatsModal
          url={selectedUrl}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}
