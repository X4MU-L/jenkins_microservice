"use client";

import { useState } from "react";

import { Check, Copy, ExternalLink } from "lucide-react";

import { Button } from "@/components/ui/button";

interface RecentUrlsListProps {
  urls: URLItem[];
}

export function RecentUrlsList({ urls }: RecentUrlsListProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-4">
      {urls.slice(0, 5).map((url) => (
        <div
          key={url.id}
          className="flex flex-col space-y-2 rounded-lg border p-4"
        >
          <div className="flex items-center justify-between">
            <span className="truncate font-medium">{url.shortUrl}</span>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => copyToClipboard(url.shortUrl || "", url.id)}
              >
                {copiedId === url.id ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <a
                  href={url.shortUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>
          <p className="text-muted-foreground truncate text-sm">
            {url.longUrl}
          </p>
          <div className="text-muted-foreground flex items-center justify-between text-xs">
            <span>Clicks: {url.clicks || 0}</span>
            <span>
              Created:{" "}
              {new Date(url.createdAt || Date.now()).toLocaleDateString()}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
