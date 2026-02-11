"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";

interface HomeTabsProps {
  jobsContent: ReactNode;
}

export function HomeTabs({ jobsContent }: HomeTabsProps) {
  const [tab, setTab] = useState<"jobs" | "talent">("jobs");

  return (
    <>
      {/* Tab bar */}
      <div className="mb-8 flex gap-6 border-b border-gray-200">
        <button
          onClick={() => setTab("jobs")}
          className={`pb-3 text-sm font-medium transition-colors duration-150 ${
            tab === "jobs"
              ? "border-b-2 border-black text-black"
              : "text-gray-400 hover:text-gray-600"
          }`}
        >
          Search Jobs
        </button>
        <button
          onClick={() => setTab("talent")}
          className={`pb-3 text-sm font-medium transition-colors duration-150 ${
            tab === "talent"
              ? "border-b-2 border-black text-black"
              : "text-gray-400 hover:text-gray-600"
          }`}
        >
          Join Talent Network
        </button>
      </div>

      {/* Tab content */}
      {tab === "jobs" ? (
        jobsContent
      ) : (
        <div className="py-8">
          <h3 className="text-xl font-light tracking-tight text-black">
            Join the ScOp Talent Network
          </h3>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-gray-500">
            Not seeing the right role today? Join our talent network and
            we&apos;ll connect you with opportunities across our portfolio
            companies as they open up. Share your background and interests, and
            we&apos;ll reach out when there&apos;s a match.
          </p>
          <Link
            href="/talent/join"
            className="mt-6 inline-block rounded-lg bg-black px-6 py-2.5 text-sm font-medium text-white transition-opacity duration-150 hover:opacity-80"
          >
            Join Now
          </Link>
        </div>
      )}
    </>
  );
}
