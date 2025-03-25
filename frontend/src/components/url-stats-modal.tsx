"use client";

import { useEffect, useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { Check, Copy, ExternalLink, Loader2 } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMediaQuery } from "@/hooks/use-media-query";
import { fetchUrlStats } from "@/lib/api";

interface UrlStatsModalProps {
  url: URLItem;
  isOpen: boolean;
  onClose: () => void;
}

export function UrlStatsModal({ url, isOpen, onClose }: UrlStatsModalProps) {
  const [copied, setCopied] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const { data: stats, isLoading } = useQuery({
    queryKey: ["urlStats", url.id],
    queryFn: () => fetchUrlStats(url.id),
    enabled: isOpen,
  });

  const copyToClipboard = () => {
    navigator.clipboard.writeText(url.shortUrl || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    if (!isOpen) {
      setCopied(false);
    }
  }, [isOpen]);

  const content = (
    <div className="grid gap-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 overflow-hidden">
          <h3 className="truncate text-lg font-semibold">{url.shortUrl}</h3>
          <Button variant="ghost" size="icon" onClick={copyToClipboard}>
            {copied ? (
              <Check className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
          <Button variant="ghost" size="icon" asChild>
            <a href={url.shortUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        </div>
        <p className="text-muted-foreground truncate text-sm">
          Original: {url.longUrl}
        </p>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="referrers">Referrers</TabsTrigger>
          <TabsTrigger value="devices">Devices</TabsTrigger>
        </TabsList>

        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <>
            <TabsContent value="overview">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Clicks
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {stats?.totalClicks || 0}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Created On
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm font-medium">
                      {new Date(
                        url.createdAt || Date.now()
                      ).toLocaleDateString()}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="mt-4">
                <CardHeader>
                  <CardTitle>Clicks Over Time</CardTitle>
                  <CardDescription>
                    Click activity for the past 30 days
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    {stats?.clicksOverTime &&
                    stats.clicksOverTime.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.clicksOverTime}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="clicks" fill="var(--primary)" />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <p className="text-muted-foreground">
                          No click data available
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="referrers">
              <Card>
                <CardHeader>
                  <CardTitle>Top Referrers</CardTitle>
                  <CardDescription>
                    Where your traffic is coming from
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {stats?.topReferrers && stats.topReferrers.length > 0 ? (
                    <div className="space-y-4">
                      {stats.topReferrers.map((referrer, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between"
                        >
                          <span className="max-w-[70%] truncate text-sm">
                            {referrer.source || "Direct"}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">
                              {referrer.count}
                            </span>
                            <span className="text-muted-foreground text-xs">
                              (
                              {Math.round(
                                (referrer.count / stats.totalClicks) * 100
                              )}
                              %)
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex h-32 items-center justify-center">
                      <p className="text-muted-foreground">
                        No referrer data available
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="devices">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Browsers</CardTitle>
                    <CardDescription>Browser distribution</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {stats?.browsers && stats.browsers.length > 0 ? (
                      <div className="space-y-4">
                        {stats.browsers.map((browser, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between"
                          >
                            <span className="text-sm">{browser.name}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">
                                {browser.count}
                              </span>
                              <span className="text-muted-foreground text-xs">
                                (
                                {Math.round(
                                  (browser.count / stats.totalClicks) * 100
                                )}
                                %)
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex h-32 items-center justify-center">
                        <p className="text-muted-foreground">
                          No browser data available
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Devices</CardTitle>
                    <CardDescription>Device type distribution</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {stats?.devices && stats.devices.length > 0 ? (
                      <div className="space-y-4">
                        {stats.devices.map((device, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between"
                          >
                            <span className="text-sm">{device.type}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">
                                {device.count}
                              </span>
                              <span className="text-muted-foreground text-xs">
                                (
                                {Math.round(
                                  (device.count / stats.totalClicks) * 100
                                )}
                                %)
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex h-32 items-center justify-center">
                        <p className="text-muted-foreground">
                          No device data available
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );

  if (isDesktop) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>URL Statistics</DialogTitle>
          </DialogHeader>
          {content}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>URL Statistics</DrawerTitle>
        </DrawerHeader>
        <div className="px-4 pb-4">{content}</div>
      </DrawerContent>
    </Drawer>
  );
}
