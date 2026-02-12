import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendTalentWelcomeEmail(
  to: string,
  firstName: string,
  departments: string[]
) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://jobs.scopvc.com";

  const { error } = await resend.emails.send({
    from: "ScOp Venture Capital <james@scopvc.com>",
    to,
    subject: "Welcome to the ScOp Talent Network",
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background-color:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#ffffff;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">

          <!-- Header -->
          <tr>
            <td style="padding-bottom:32px;border-bottom:1px solid #e5e7eb;">
              <span style="font-size:18px;font-weight:500;color:#000000;letter-spacing:-0.02em;">ScOp Venture Capital</span>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px 0;">
              <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#374151;">
                Hi ${firstName},
              </p>
              <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#374151;">
                Thanks for joining the ScOp Talent Network. We'll send you relevant roles as they come in across our portfolio companies.
              </p>

              <!-- Interests -->
              <p style="margin:0 0 12px;font-size:13px;font-weight:500;color:#9ca3af;text-transform:uppercase;letter-spacing:0.05em;">
                Your interests
              </p>
              <div style="margin:0 0 28px;">
                ${departments
                  .map(
                    (d) =>
                      `<span style="display:inline-block;margin:0 6px 6px 0;padding:6px 14px;font-size:13px;color:#374151;border:1px solid #e5e7eb;border-radius:9999px;">${d}</span>`
                  )
                  .join("")}
              </div>

              <!-- CTA -->
              <a href="${siteUrl}" style="display:inline-block;padding:12px 24px;background-color:#000000;color:#ffffff;font-size:14px;font-weight:500;text-decoration:none;border-radius:8px;">
                Browse Open Roles
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding-top:24px;border-top:1px solid #e5e7eb;">
              <p style="margin:0;font-size:12px;color:#9ca3af;">
                ScOp Venture Capital
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim(),
  });

  if (error) {
    console.error("Failed to send welcome email:", error);
  }
}
