"use client";

import { useState } from "react";

import {
  BarChart,
  Copy,
  ExternalLink,
  MoreHorizontal,
  Trash,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface UrlListProps {
  urls: URLItem[];
  onViewStats: (url: URLItem) => void;
  onDelete: (id: string) => void;
}

export function UrlList({ urls, onViewStats, onDelete }: UrlListProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {urls.map((url) => (
        <Card key={url.id}>
          <CardHeader className="pb-2">
            <CardTitle className="truncate text-lg">{url.shortUrl}</CardTitle>
            <CardDescription className="truncate">
              {url.longUrl}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between text-sm">
              <span>Clicks: {url.clicks || 0}</span>
              <span>
                Created:{" "}
                {new Date(url.createdAt || Date.now()).toLocaleDateString()}
              </span>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewStats(url)}
            >
              <BarChart className="mr-2 h-4 w-4" />
              Stats
            </Button>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => copyToClipboard(url.shortUrl || "", url.id)}
              >
                {copiedId === url.id ? (
                  <span className="text-xs">Copied!</span>
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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => onDelete(url.id)}
                  >
                    <Trash className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
