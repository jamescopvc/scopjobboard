import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { logout } from "./actions";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  return (
    <div>
      <nav className="border-b border-gray-100">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-6">
            <span className="text-sm font-medium text-black">Admin</span>
            <Link href="/admin" className="text-xs text-gray-400 transition-colors duration-150 hover:text-black">
              Companies
            </Link>
            <Link href="/admin/talent" className="text-xs text-gray-400 transition-colors duration-150 hover:text-black">
              Talent Network
            </Link>
          </div>
          <form action={logout}>
            <button
              type="submit"
              className="text-xs text-gray-400 transition-colors duration-150 hover:text-black"
            >
              Sign out
            </button>
          </form>
        </div>
      </nav>
      <div className="mx-auto max-w-6xl px-6 py-8">{children}</div>
    </div>
  );
}
