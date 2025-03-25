// This is a mock API client for demonstration purposes
// In a real application, you would replace these with actual API calls

// Mock data
const mockUrls: URLItem[] = [
  {
    id: "1",
    longUrl: "https://example.com/very/long/url/that/needs/shortening/1",
    shortUrl: "https://short.url/abc123",
    status: "active",
    clicks: 42,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "2",
    longUrl: "https://example.com/very/long/url/that/needs/shortening/2",
    shortUrl: "https://short.url/def456",
    status: "active",
    clicks: 18,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "3",
    longUrl: "https://example.com/very/long/url/that/needs/shortening/3",
    shortUrl: "https://short.url/ghi789",
    status: "archived",
    clicks: 7,
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// Mock stats data
const mockStats = {
  totalClicks: 42,
  clicksOverTime: [
    { date: "2023-01-01", clicks: 5 },
    { date: "2023-01-02", clicks: 8 },
    { date: "2023-01-03", clicks: 12 },
    { date: "2023-01-04", clicks: 7 },
    { date: "2023-01-05", clicks: 10 },
  ],
  topReferrers: [
    { source: "Google", count: 15 },
    { source: "Twitter", count: 12 },
    { source: "Facebook", count: 8 },
    { source: "Direct", count: 7 },
  ],
  browsers: [
    { name: "Chrome", count: 25 },
    { name: "Firefox", count: 10 },
    { name: "Safari", count: 7 },
  ],
  devices: [
    { type: "Desktop", count: 30 },
    { type: "Mobile", count: 10 },
    { type: "Tablet", count: 2 },
  ],
};

// Simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// API functions
export async function fetchUrls(): Promise<URLItem[]> {
  await delay(800);
  return [...mockUrls];
}

export async function fetchRecentUrls(): Promise<URLItem[]> {
  await delay(600);
  return [...mockUrls]
    .sort((a, b) => {
      return (
        new Date(b.createdAt || 0).getTime() -
        new Date(a.createdAt || 0).getTime()
      );
    })
    .slice(0, 5);
}

export async function fetchUrlStats(id: string) {
  await delay(1000);
  return { ...mockStats };
}

export async function createUrl(data: {
  longUrl: string;
  customAlias?: string;
}): Promise<URLItem> {
  await delay(1200);

  const newUrl: URLItem = {
    id: `url-${Date.now()}`,
    longUrl: data.longUrl,
    shortUrl: `https://short.url/${data.customAlias || Math.random().toString(36).substring(2, 8)}`,
    status: "active",
    clicks: 0,
    createdAt: new Date().toISOString(),
  };

  // In a real app, we would add this to the database
  mockUrls.unshift(newUrl);

  return newUrl;
}

export async function deleteUrl(id: string): Promise<void> {
  await delay(800);

  // In a real app, we would delete from the database
  const index = mockUrls.findIndex((url) => url.id === id);
  if (index !== -1) {
    mockUrls.splice(index, 1);
  }
}
