import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  return (
    <div>
      <h1 className="mb-2 text-3xl font-bold">
        Welcome, {session.user.name}
      </h1>
      <p className="text-muted-foreground">
        Manage your quizzes and monitor submissions.
      </p>
    </div>
  );
}
