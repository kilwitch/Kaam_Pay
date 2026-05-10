"use client";

import { useEffect, useRef, useState, KeyboardEvent, ClipboardEvent } from "react";
import { verifyOTP, resendOTP } from "@/app/lib/actions/auth";
import { Loader2, Mail, RefreshCw } from "lucide-react";

interface Props {
  email: string;
  onSuccess: () => void;
}

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 60; // seconds

export default function StepOTPVerify({ email, onSuccess }: Props) {
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const focusNext = (index: number) => {
    if (index < OTP_LENGTH - 1) inputRefs.current[index + 1]?.focus();
  };
  const focusPrev = (index: number) => {
    if (index > 0) inputRefs.current[index - 1]?.focus();
  };

  const handleChange = (index: number, value: string) => {
    // Only allow single digit
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = digit;
    setDigits(next);
    setError(null);
    if (digit) focusNext(index);
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (digits[index]) {
        const next = [...digits];
        next[index] = "";
        setDigits(next);
      } else {
        focusPrev(index);
      }
    } else if (e.key === "ArrowLeft") {
      focusPrev(index);
    } else if (e.key === "ArrowRight") {
      focusNext(index);
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!pasted) return;
    const next = Array(OTP_LENGTH).fill("");
    pasted.split("").forEach((ch, i) => { next[i] = ch; });
    setDigits(next);
    // Focus last filled
    const lastIdx = Math.min(pasted.length, OTP_LENGTH - 1);
    inputRefs.current[lastIdx]?.focus();
  };

  const handleVerify = async () => {
    const otp = digits.join("");
    if (otp.length < OTP_LENGTH) {
      setError("Please enter all 6 digits.");
      return;
    }
    setIsVerifying(true);
    setError(null);
    const result = await verifyOTP(email, otp);
    setIsVerifying(false);
    if (!result.success) {
      setError(result.error);
      setDigits(Array(OTP_LENGTH).fill(""));
      inputRefs.current[0]?.focus();
      return;
    }
    onSuccess();
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    setIsResending(true);
    setError(null);
    const result = await resendOTP(email);
    setIsResending(false);
    if (!result.success) {
      setError(result.error);
      return;
    }
    setDigits(Array(OTP_LENGTH).fill(""));
    setCooldown(RESEND_COOLDOWN);
    inputRefs.current[0]?.focus();
  };

  const isComplete = digits.every((d) => d !== "");

  return (
    <div className="reg-step">
      <div className="reg-brand">KaamPay</div>

      <div className="otp-mail-icon">
        <Mail size={28} strokeWidth={1.5} />
      </div>

      <h1 className="reg-title">Check your email</h1>
      <p className="reg-subtitle">
        We sent a 6-digit verification code to
        <br />
        <strong className="text-[--foreground]">{email}</strong>
      </p>

      {/* OTP Input Boxes */}
      <div className="otp-boxes">
        {digits.map((digit, i) => (
          <input
            key={i}
            ref={(el) => { inputRefs.current[i] = el; }}
            id={`otp-box-${i}`}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            autoFocus={i === 0}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={i === 0 ? handlePaste : undefined}
            className={`otp-box ${digit ? "filled" : ""} ${error ? "error" : ""}`}
            aria-label={`OTP digit ${i + 1}`}
          />
        ))}
      </div>

      {error && <div className="reg-server-error">{error}</div>}

      <button
        onClick={handleVerify}
        disabled={isVerifying || !isComplete}
        className="reg-submit-btn"
        id="verify-otp-btn"
      >
        {isVerifying ? (
          <Loader2 size={18} className="animate-spin" />
        ) : (
          "Verify Code"
        )}
      </button>

      {/* Resend */}
      <div className="otp-resend-row">
        <span>Didn&apos;t receive it?</span>
        <button
          onClick={handleResend}
          disabled={cooldown > 0 || isResending}
          className="otp-resend-btn"
          id="resend-otp-btn"
        >
          {isResending ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <RefreshCw size={14} />
          )}
          {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
        </button>
      </div>
    </div>
  );
}
