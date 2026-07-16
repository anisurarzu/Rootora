import Link from "next/link";
import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <MainLayout>
      <div className="container-rootora flex min-h-[60vh] flex-col items-center justify-center text-center section-padding">
        <p className="font-heading text-8xl font-semibold text-primary/20">404</p>
        <h1 className="mt-4 font-heading text-3xl font-semibold text-heading">
          Page Not Found
        </h1>
        <p className="mt-2 max-w-md text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Button size="lg" className="mt-8" asChild>
          <Link href="/">Return Home</Link>
        </Button>
      </div>
    </MainLayout>
  );
}
