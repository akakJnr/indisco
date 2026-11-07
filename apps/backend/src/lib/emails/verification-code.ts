const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")

/** Email with the 6-digit code a customer enters to confirm their email. */
export function verificationCodeEmail(code: string, expiresInMinutes: number) {
  const safeCode = escapeHtml(code)
  const digits = safeCode
    .split("")
    .map(
      (digit) =>
        `<td style="width:44px;height:56px;text-align:center;font-size:28px;font-weight:bold;color:#1a5490;background:#eef5fc;border:1px solid #d6e6f7;border-radius:10px;">${digit}</td><td style="width:8px;"></td>`
    )
    .join("")

  const html = `<!doctype html>
<html>
  <body style="margin:0;background:#f4f6f8;font-family:Arial,Helvetica,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:24px 0;">
      <tr><td align="center">
        <table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;">
          <tr><td style="background:#1a5490;padding:24px 32px;">
            <div style="color:#ffffff;font-size:22px;font-weight:bold;">R'Indisco Supermarket</div>
            <div style="color:#ffb05c;font-size:13px;margin-top:4px;">Verify your email address</div>
          </td></tr>
          <tr><td style="padding:32px;">
            <h1 style="margin:0 0 8px;font-size:20px;color:#111827;">Your verification code</h1>
            <p style="margin:0 0 24px;font-size:14px;line-height:22px;color:#4b5563;">
              Enter this code on the website to confirm your email and finish signing in.
            </p>
            <table cellpadding="0" cellspacing="0" style="margin:0 auto 24px;"><tr>${digits}</tr></table>
            <p style="margin:0;font-size:13px;line-height:20px;color:#6b7280;">
              The code expires in ${expiresInMinutes} minutes. If you did not create an account
              with R'Indisco Supermarket, you can ignore this email.
            </p>
          </td></tr>
          <tr><td style="background:#f9fafb;padding:16px 32px;font-size:12px;color:#6b7280;">
            Never share this code with anyone. We will never ask you for it.
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`

  return {
    subject: `${code} is your R'Indisco Supermarket verification code`,
    html,
  }
}
