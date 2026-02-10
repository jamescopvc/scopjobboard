import { createClient } from "@/lib/supabase/server";
import { JOBS_PER_PAGE } from "@/lib/constants";
import type { LiveJob } from "@/lib/types";
import { JobsContent } from "@/components/jobs-content";

export const metadata = {
  title: "Portfolio Job Directory",
  description:
    "Browse open roles across our portfolio companies and find your next opportunity.",
};

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;

  const departments: string[] = Array.isArray(params.department)
    ? params.department
    : typeof params.department === "string"
      ? [params.department]
      : [];

  const selectedCompanies: string[] = Array.isArray(params.company)
    ? params.company
    : typeof params.company === "string"
      ? [params.company]
      : [];
  const search = typeof params.q === "string" ? params.q.trim() : "";
  const page = Math.max(1, Number(params.page) || 1);

  const supabase = await createClient();

  let query = supabase
    .from("live_jobs")
    .select("*", { count: "exact" })
    .order("company_name", { ascending: true })
    .order("title", { ascending: true });

  if (departments.length > 0) {
    query = query.in("department_tag", departments);
  }
  if (selectedCompanies.length > 0) {
    query = query.in("company_slug", selectedCompanies);
  }
  if (search) {
    const pattern = `%${search}%`;
    query = query.or(
      `title.ilike.${pattern},company_name.ilike.${pattern},location.ilike.${pattern},department_tag.ilike.${pattern}`
    );
  }

  const from = (page - 1) * JOBS_PER_PAGE;
  query = query.range(from, from + JOBS_PER_PAGE - 1);

  const { data: jobs, count } = await query;

  const { data: companiesData } = await supabase
    .from("live_jobs")
    .select("company_slug, company_name");

  const companiesMap = new Map<string, string>();
  companiesData?.forEach((j) => {
    if (!companiesMap.has(j.company_slug)) {
      companiesMap.set(j.company_slug, j.company_name);
    }
  });
  const companies = Array.from(companiesMap.entries())
    .map(([slug, name]) => ({ slug, name }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <h1 className="mb-6 text-4xl font-light tracking-tight text-black">
        Open Positions
      </h1>
      <JobsContent
        initialJobs={(jobs as LiveJob[]) ?? []}
        initialCount={count ?? 0}
        companies={companies}
        initialDepartments={departments}
        initialCompanies={selectedCompanies}
        initialSearch={search}
        initialPage={page}
      />
    </div>
  );
}
