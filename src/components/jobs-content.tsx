"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/browser";
import { JOBS_PER_PAGE } from "@/lib/constants";
import type { LiveJob } from "@/lib/types";
import { JobCard } from "@/components/job-card";
import { JobFilters, JobSearch } from "@/components/job-filters";
import { Pagination } from "@/components/pagination";

interface JobsContentProps {
  initialJobs: LiveJob[];
  initialCount: number;
  companies: { slug: string; name: string }[];
  initialDepartments: string[];
  initialCompanies: string[];
  initialSearch: string;
  initialPage: number;
  basePath?: string;
}

function parseParams() {
  const sp = new URLSearchParams(window.location.search);
  return {
    departments: sp.getAll("department"),
    companies: sp.getAll("company"),
    search: sp.get("q")?.trim() ?? "",
    page: Math.max(1, Number(sp.get("page")) || 1),
  };
}

function buildQs(departments: string[], companies: string[], search: string, page: number) {
  const sp = new URLSearchParams();
  departments.forEach((d) => sp.append("department", d));
  companies.forEach((c) => sp.append("company", c));
  if (search) sp.set("q", search);
  if (page > 1) sp.set("page", String(page));
  const qs = sp.toString();
  return qs ? `?${qs}` : "";
}

export function JobsContent({
  initialJobs,
  initialCount,
  companies,
  initialDepartments,
  initialCompanies,
  initialSearch,
  initialPage,
  basePath = "/jobs",
}: JobsContentProps) {
  const [departments, setDepartments] = useState(initialDepartments);
  const [selectedCompanies, setSelectedCompanies] = useState(initialCompanies);
  const [search, setSearch] = useState(initialSearch);
  const [page, setPage] = useState(initialPage);
  const [jobs, setJobs] = useState<LiveJob[]>(initialJobs);
  const [totalPages, setTotalPages] = useState(Math.ceil(initialCount / JOBS_PER_PAGE));
  const [loading, setLoading] = useState(false);
  const isInitial = useRef(true);

  const fetchJobs = useCallback(async (deps: string[], comps: string[], q: string, p: number) => {
    setLoading(true);
    const supabase = createClient();

    let query = supabase
      .from("live_jobs")
      .select("*", { count: "exact" })
      .order("company_name", { ascending: true })
      .order("title", { ascending: true });

    if (deps.length > 0) query = query.in("department_tag", deps);
    if (comps.length > 0) query = query.in("company_slug", comps);
    if (q) {
      const pattern = `%${q}%`;
      query = query.or(
        `title.ilike.${pattern},company_name.ilike.${pattern},location.ilike.${pattern},department_tag.ilike.${pattern}`
      );
    }

    const from = (p - 1) * JOBS_PER_PAGE;
    query = query.range(from, from + JOBS_PER_PAGE - 1);

    const { data, count } = await query;
    setJobs((data as LiveJob[]) ?? []);
    setTotalPages(Math.ceil((count ?? 0) / JOBS_PER_PAGE));
    setLoading(false);
  }, []);

  // On state change (not initial mount), update URL and fetch
  useEffect(() => {
    if (isInitial.current) {
      isInitial.current = false;
      return;
    }
    const qs = buildQs(departments, selectedCompanies, search, page);
    window.history.replaceState(null, "", `${basePath}${qs}`);
    fetchJobs(departments, selectedCompanies, search, page);
  }, [departments, selectedCompanies, search, page, fetchJobs]);

  // Handle browser back/forward
  useEffect(() => {
    function onPopState() {
      const p = parseParams();
      setDepartments(p.departments);
      setSelectedCompanies(p.companies);
      setSearch(p.search);
      setPage(p.page);
    }
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  function handleDepartmentChange(newDeps: string[]) {
    setDepartments(newDeps);
    setPage(1);
  }

  function handleCompanyChange(newComps: string[]) {
    setSelectedCompanies(newComps);
    setPage(1);
  }

  function handleSearchChange(value: string) {
    setSearch(value);
    setPage(1);
  }

  function handlePageChange(newPage: number) {
    setPage(newPage);
  }

  return (
    <>
      <div className="mb-4 max-w-md">
        <JobSearch currentSearch={search} onSearchChange={handleSearchChange} />
      </div>
      <div className="mb-6">
        <JobFilters
          currentDepartments={departments}
          currentCompanies={selectedCompanies}
          companies={companies}
          onDepartmentChange={handleDepartmentChange}
          onCompanyChange={handleCompanyChange}
        />
      </div>
      <div className={`mt-8 grid gap-3${loading ? " opacity-60 transition-opacity" : ""}`}>
        {jobs.length ? (
          jobs.map((job) => <JobCard key={job.id} job={job} />)
        ) : (
          <p className="py-16 text-center text-sm text-gray-400">
            No jobs found matching your filters.
          </p>
        )}
      </div>
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </>
  );
}
