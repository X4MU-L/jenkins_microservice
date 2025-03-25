import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center text-center">
      <h1 className="mb-4 text-4xl font-bold tracking-tight">
        Shorten Your Links, Expand Your Reach
      </h1>
      <p className="text-muted-foreground mb-8 max-w-2xl text-lg">
        Create short, memorable links that redirect to your long URLs. Track
        clicks and analyze your link performance.
      </p>
      <div className="flex gap-4">
        <Button asChild size="lg">
          <Link href="/create-url">Get Started</Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/signup">Sign Up</Link>
        </Button>
      </div>
    </div>
  );
}
