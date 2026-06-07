import Link from "next/link";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function InstructorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-64 flex-col border-r bg-muted/40 p-4">
        <h1 className="mb-8 text-xl font-bold">Qwizz</h1>
        <nav className="flex flex-col gap-2">
          <Link
            href="/dashboard"
            className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted"
          >
            Dashboard
          </Link>
          <Link
            href="/quizzes"
            className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted"
          >
            Quizzes
          </Link>
        </nav>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
