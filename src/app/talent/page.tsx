import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Talent Network — ScOp Venture Capital",
  description:
    "Join the ScOp Talent Network and get matched with roles across our portfolio companies.",
};

export default function TalentPage() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col justify-center px-6 py-16">
      <h1 className="text-3xl font-light tracking-tight text-black sm:text-4xl">
        ScOp Talent Network
      </h1>
      <p className="mt-4 text-base leading-relaxed text-gray-500">
        We work with some of the best software and AI companies out there. Join
        our talent network and we&apos;ll connect you with relevant roles as
        they open up across the portfolio.
      </p>
      <p className="mt-3 text-base leading-relaxed text-gray-500">
        Share a bit about yourself and what you&apos;re interested in — we&apos;ll
        reach out when there&apos;s a match.
      </p>
      <div className="mt-8 flex items-center gap-4">
        <Link
          href="/talent/join"
          className="inline-block rounded-lg bg-black px-6 py-2.5 text-sm font-medium text-white transition-opacity duration-150 hover:opacity-80"
        >
          Join Now
        </Link>
        <Link
          href="/"
          className="text-sm text-gray-400 transition-colors duration-150 hover:text-black"
        >
          Browse Open Roles
        </Link>
      </div>
    </div>
  );
}
