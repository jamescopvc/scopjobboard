import { createAdminClient } from "@/lib/supabase/admin";
import type { TalentProfile } from "@/lib/types";

export default async function AdminTalentPage() {
  const supabase = createAdminClient();

  const { data: profiles, error } = await supabase
    .from("talent_profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return <p className="text-sm text-red-600">Failed to load profiles: {error.message}</p>;
  }

  const typedProfiles = (profiles ?? []) as TalentProfile[];

  // Generate signed URLs for resumes
  const profilesWithUrls = await Promise.all(
    typedProfiles.map(async (p) => {
      let resumeUrl: string | null = null;
      if (p.resume_path) {
        const { data } = await supabase.storage
          .from("resumes")
          .createSignedUrl(p.resume_path, 3600);
        resumeUrl = data?.signedUrl ?? null;
      }
      return { ...p, resumeUrl };
    })
  );

  return (
    <div>
      <h1 className="mb-8 text-2xl font-semibold tracking-tight text-black">
        Talent Network
      </h1>

      {profilesWithUrls.length === 0 ? (
        <p className="text-sm text-gray-500">No profiles submitted yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-xs font-medium uppercase tracking-wide text-gray-400">
                <th className="py-3 pr-4">Name</th>
                <th className="py-3 pr-4">Email</th>
                <th className="py-3 pr-4">LinkedIn</th>
                <th className="py-3 pr-4">Location</th>
                <th className="py-3 pr-4">Departments</th>
                <th className="py-3 pr-4">Resume</th>
                <th className="py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {profilesWithUrls.map((p) => (
                <tr key={p.id} className="border-b border-gray-100">
                  <td className="py-3 pr-4 font-medium text-black">{p.full_name}</td>
                  <td className="py-3 pr-4 text-gray-600">{p.email}</td>
                  <td className="py-3 pr-4">
                    {p.linkedin_url ? (
                      <a
                        href={p.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-500 underline transition-colors duration-150 hover:text-black"
                      >
                        Profile
                      </a>
                    ) : (
                      <span className="text-gray-300">&mdash;</span>
                    )}
                  </td>
                  <td className="py-3 pr-4 text-gray-600">
                    {p.location || <span className="text-gray-300">&mdash;</span>}
                  </td>
                  <td className="py-3 pr-4">
                    <div className="flex flex-wrap gap-1">
                      {p.departments.map((d) => (
                        <span
                          key={d}
                          className="inline-block rounded-full border border-gray-200 px-2 py-0.5 text-xs text-gray-600"
                        >
                          {d}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 pr-4">
                    {p.resumeUrl ? (
                      <a
                        href={p.resumeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-500 underline transition-colors duration-150 hover:text-black"
                      >
                        Download
                      </a>
                    ) : (
                      <span className="text-gray-300">&mdash;</span>
                    )}
                  </td>
                  <td className="py-3 whitespace-nowrap text-gray-500">
                    {new Date(p.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
