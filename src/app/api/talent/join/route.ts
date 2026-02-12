import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { DEPARTMENT_TAGS } from "@/lib/constants";
import { sendTalentWelcomeEmail } from "@/lib/email";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    // Honeypot check — bots fill this hidden field, real users don't
    if (formData.get("company_url")) {
      return NextResponse.json({ success: true });
    }

    const fullName = (formData.get("full_name") as string | null)?.trim();
    const email = (formData.get("email") as string | null)?.trim();
    const linkedinUrl =
      (formData.get("linkedin_url") as string | null)?.trim() || null;
    const location =
      (formData.get("location") as string | null)?.trim() || null;
    const departmentsRaw = formData.get("departments") as string | null;
    const resumeFile = formData.get("resume") as File | null;

    // Validate required fields
    if (!fullName) {
      return NextResponse.json(
        { error: "Full name is required." },
        { status: 400 }
      );
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "A valid email is required." },
        { status: 400 }
      );
    }

    let departments: string[] = [];
    try {
      departments = departmentsRaw ? JSON.parse(departmentsRaw) : [];
    } catch {
      return NextResponse.json(
        { error: "Invalid departments format." },
        { status: 400 }
      );
    }

    if (
      !Array.isArray(departments) ||
      departments.length === 0 ||
      !departments.every((d) =>
        (DEPARTMENT_TAGS as readonly string[]).includes(d)
      )
    ) {
      return NextResponse.json(
        { error: "At least one valid department is required." },
        { status: 400 }
      );
    }

    // Validate resume if present
    let resumePath: string | null = null;

    if (resumeFile && resumeFile.size > 0) {
      if (resumeFile.type !== "application/pdf") {
        return NextResponse.json(
          { error: "Resume must be a PDF file." },
          { status: 400 }
        );
      }
      if (resumeFile.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: "Resume must be under 5 MB." },
          { status: 400 }
        );
      }

      const supabase = createAdminClient();
      const fileId = crypto.randomUUID();
      resumePath = `${fileId}.pdf`;

      const buffer = Buffer.from(await resumeFile.arrayBuffer());
      const { error: uploadError } = await supabase.storage
        .from("resumes")
        .upload(resumePath, buffer, {
          contentType: "application/pdf",
          upsert: false,
        });

      if (uploadError) {
        console.error("Resume upload error:", uploadError);
        return NextResponse.json(
          { error: "Failed to upload resume." },
          { status: 500 }
        );
      }
    }

    // Insert profile
    const supabase = createAdminClient();
    const { error: insertError } = await supabase
      .from("talent_profiles")
      .insert({
        full_name: fullName,
        email,
        linkedin_url: linkedinUrl,
        location,
        departments,
        resume_path: resumePath,
      });

    if (insertError) {
      console.error("Talent profile insert error:", insertError);
      return NextResponse.json(
        { error: "Failed to save profile." },
        { status: 500 }
      );
    }

    // Send welcome email (fire-and-forget — don't block the response)
    const firstName = fullName.split(" ")[0];
    sendTalentWelcomeEmail(email, firstName, departments).catch((err) => {
      console.error("Welcome email failed:", err);
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Talent join error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
