import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col justify-center px-6 py-12">
      <div className="space-y-6">
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            Trainer Schedule App
          </p>

          <h1 className="mt-2 text-4xl font-bold tracking-tight">
            Build show schedules from entry data.
          </h1>

          <p className="mt-4 max-w-2xl text-muted-foreground">
            Import event entries, select your team horses, and generate a clean
            daily schedule for dressage, cross country, and show jumping.
          </p>
        </div>

        <div className="flex gap-3">
          <Link href="/import" className={buttonVariants()}>
            Import Schedule
          </Link>

          <Link
            href="/schedule"
            className={buttonVariants({ variant: "outline" })}
          >
            View Schedule
          </Link>
        </div>
      </div>
    </main>
  );
}