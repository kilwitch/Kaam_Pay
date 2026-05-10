"use server";

import bcrypt from "bcryptjs";
// Note: This file runs in Node.js runtime (server actions), not Edge
import sql from "@/app/lib/db";
import { sendOTPEmail } from "@/app/lib/email";

// ─── Types ───────────────────────────────────────────────────────────────────

type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string };

// ─── Helpers ─────────────────────────────────────────────────────────────────

function generateOTP(): string {
  const arr = new Uint32Array(1);
  crypto.getRandomValues(arr);
  return String(100000 + (arr[0] % 900000));
}

// ─── Step 1: Register with email + password ───────────────────────────────────

export async function registerUser(
  email: string,
  password: string,
  firstName: string,
  lastName: string
): Promise<ActionResult<{ userId: string }>> {
  try {
    // Check if email already exists and is verified
    const existing = await sql`
      SELECT id, is_email_verified FROM users WHERE email = ${email}
    `;

    if (existing.length > 0 && existing[0].is_email_verified) {
      return { success: false, error: "An account with this email already exists." };
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const otp = generateOTP();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min
    const fullName = `${firstName} ${lastName}`;

    let userId: string;

    if (existing.length > 0) {
      // Unverified user — update their record with new credentials and fresh OTP
      const updated = await sql`
        UPDATE users
        SET
          password_hash   = ${passwordHash},
          full_name       = ${fullName},
          otp_code        = ${otp},
          otp_expires_at  = ${otpExpiresAt},
          updated_at      = NOW()
        WHERE email = ${email}
        RETURNING id
      `;
      userId = updated[0].id;
    } else {
      // Brand-new user
      const inserted = await sql`
        INSERT INTO users (email, password_hash, full_name, otp_code, otp_expires_at, provider)
        VALUES (${email}, ${passwordHash}, ${fullName}, ${otp}, ${otpExpiresAt}, 'credentials')
        RETURNING id
      `;
      userId = inserted[0].id;
    }

    await sendOTPEmail(email, otp, firstName);

    return { success: true, data: { userId } };
  } catch (err) {
    console.error("[registerUser]", err);
    return { success: false, error: "Failed to register. Please try again." };
  }
}

// ─── Step 2: Verify OTP ───────────────────────────────────────────────────────

export async function verifyOTP(
  email: string,
  otp: string
): Promise<ActionResult> {
  try {
    const rows = await sql`
      SELECT otp_code, otp_expires_at FROM users WHERE email = ${email}
    `;

    if (rows.length === 0) {
      return { success: false, error: "User not found." };
    }

    const { otp_code, otp_expires_at } = rows[0];

    if (!otp_code || !otp_expires_at) {
      return { success: false, error: "No OTP found. Please request a new one." };
    }

    if (new Date() > new Date(otp_expires_at)) {
      return { success: false, error: "OTP has expired. Please request a new one." };
    }

    if (otp_code !== otp) {
      return { success: false, error: "Incorrect OTP. Please try again." };
    }

    await sql`
      UPDATE users
      SET
        is_email_verified = TRUE,
        otp_code          = NULL,
        otp_expires_at    = NULL,
        updated_at        = NOW()
      WHERE email = ${email}
    `;

    return { success: true };
  } catch (err) {
    console.error("[verifyOTP]", err);
    return { success: false, error: "Verification failed. Please try again." };
  }
}

// ─── Step 2b: Resend OTP ─────────────────────────────────────────────────────

export async function resendOTP(email: string): Promise<ActionResult> {
  try {
    const rows = await sql`
      SELECT full_name FROM users WHERE email = ${email}
    `;

    if (rows.length === 0) {
      return { success: false, error: "User not found." };
    }

    const firstName = (rows[0].full_name as string)?.split(" ")[0] ?? "there";
    const otp = generateOTP();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await sql`
      UPDATE users
      SET otp_code = ${otp}, otp_expires_at = ${otpExpiresAt}, updated_at = NOW()
      WHERE email = ${email}
    `;

    await sendOTPEmail(email, otp, firstName);

    return { success: true };
  } catch (err) {
    console.error("[resendOTP]", err);
    return { success: false, error: "Failed to resend OTP. Please try again." };
  }
}

// ─── Step 3: Set Username ─────────────────────────────────────────────────────

export async function setUsername(
  email: string,
  username: string
): Promise<ActionResult> {
  try {
    const taken = await sql`
      SELECT id FROM users WHERE username = ${username.toLowerCase()}
    `;

    if (taken.length > 0) {
      return { success: false, error: "Username is already taken." };
    }

    await sql`
      UPDATE users
      SET username = ${username.toLowerCase()}, updated_at = NOW()
      WHERE email = ${email}
    `;

    return { success: true };
  } catch (err) {
    console.error("[setUsername]", err);
    return { success: false, error: "Failed to save username. Please try again." };
  }
}

// ─── Step 4: Set Role ─────────────────────────────────────────────────────────

export async function setRole(
  email: string,
  role: "client" | "freelancer"
): Promise<ActionResult> {
  try {
    await sql`
      UPDATE users
      SET role = ${role}, updated_at = NOW()
      WHERE email = ${email}
    `;

    return { success: true };
  } catch (err) {
    console.error("[setRole]", err);
    return { success: false, error: "Failed to save role. Please try again." };
  }
}

// ─── Helpers for NextAuth ─────────────────────────────────────────────────────

export async function getUserByEmail(email: string) {
  const rows = await sql`SELECT * FROM users WHERE email = ${email}`;
  return rows[0] ?? null;
}

export async function upsertGoogleUser(profile: {
  email: string;
  name: string;
  image: string;
  providerAccountId: string;
}) {
  const existing = await sql`SELECT id FROM users WHERE email = ${profile.email}`;

  if (existing.length > 0) {
    await sql`
      UPDATE users
      SET avatar_url = ${profile.image}, updated_at = NOW()
      WHERE email = ${profile.email}
    `;
    return existing[0].id as string;
  }

  const inserted = await sql`
    INSERT INTO users (email, full_name, avatar_url, provider, provider_account_id, is_email_verified)
    VALUES (${profile.email}, ${profile.name}, ${profile.image}, 'google', ${profile.providerAccountId}, TRUE)
    RETURNING id
  `;
  return inserted[0].id as string;
}
