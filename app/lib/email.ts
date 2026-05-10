import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";

export async function sendOTPEmail(
  email: string,
  otp: string,
  firstName: string
) {
  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: "Your KaamPay verification code",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </head>
        <body style="margin:0;padding:0;background:#f7f9fb;font-family:'Inter',Arial,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
            <tr>
              <td align="center">
                <table width="480" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
                  <!-- Header -->
                  <tr>
                    <td style="background:linear-gradient(135deg,#4a4bd7,#6d5bff);padding:32px 40px;text-align:center;">
                      <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;letter-spacing:-0.5px;">KaamPay</h1>
                      <p style="margin:8px 0 0;color:rgba(255,255,255,0.8);font-size:14px;">India's Micro-Freelancing Platform</p>
                    </td>
                  </tr>
                  <!-- Body -->
                  <tr>
                    <td style="padding:40px;">
                      <h2 style="margin:0 0 8px;color:#1a1a2e;font-size:22px;font-weight:700;">Hello, ${firstName}! 👋</h2>
                      <p style="margin:0 0 32px;color:#64748b;font-size:15px;line-height:1.6;">
                        Use the verification code below to confirm your email address and get started on KaamPay.
                      </p>
                      <!-- OTP Box -->
                      <div style="background:#f0f4ff;border:2px dashed #4a4bd7;border-radius:12px;padding:28px;text-align:center;margin-bottom:32px;">
                        <p style="margin:0 0 8px;color:#4a4bd7;font-size:12px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;">Verification Code</p>
                        <p style="margin:0;color:#1a1a2e;font-size:40px;font-weight:800;letter-spacing:12px;font-family:'Courier New',monospace;">${otp}</p>
                        <p style="margin:12px 0 0;color:#94a3b8;font-size:12px;">Expires in 10 minutes</p>
                      </div>
                      <p style="margin:0;color:#94a3b8;font-size:13px;line-height:1.6;">
                        If you didn't request this code, you can safely ignore this email.
                        Someone may have typed your email address by mistake.
                      </p>
                    </td>
                  </tr>
                  <!-- Footer -->
                  <tr>
                    <td style="border-top:1px solid #f1f5f9;padding:24px 40px;text-align:center;">
                      <p style="margin:0;color:#cbd5e1;font-size:12px;">© 2024 KaamPay · India's Micro-Freelancing Platform</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
  });

  if (error) {
    throw new Error(`Failed to send OTP email: ${error.message}`);
  }
}
