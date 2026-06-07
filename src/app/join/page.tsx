"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { joinQuizAction } from "./actions";

export default function JoinPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      await joinQuizAction(formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Join Quiz</CardTitle>
          <CardDescription>
            Enter the join code provided by your instructor
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="joinCode">Join Code</Label>
              <Input
                id="joinCode"
                name="joinCode"
                type="text"
                placeholder="e.g. ABC123"
                maxLength={6}
                className="text-center font-mono text-lg tracking-widest uppercase"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="nim">NIM</Label>
              <Input
                id="nim"
                name="nim"
                type="text"
                placeholder="e.g. 1234567890"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="e.g. John Doe"
                required
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Joining..." : "Join Quiz"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
