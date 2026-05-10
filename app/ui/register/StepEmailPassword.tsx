"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { emailPasswordSchema, type EmailPasswordFormData } from "@/app/lib/validations";
import { registerUser } from "@/app/lib/actions/auth";
import AuthButton from "@/app/ui/AuthButton";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

interface Props {
  onSuccess: (email: string) => void;
}

export default function StepEmailPassword({ onSuccess }: Props) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EmailPasswordFormData>({
    resolver: zodResolver(emailPasswordSchema),
  });

  const onSubmit = async (data: EmailPasswordFormData) => {
    setServerError(null);
    const result = await registerUser(
      data.email,
      data.password,
      data.firstName,
      data.lastName
    );

    if (!result.success) {
      setServerError(result.error);
      return;
    }

    onSuccess(data.email);
  };

  return (
    <div className="reg-step">
      <div className="reg-brand">KaamPay</div>
      <h1 className="reg-title">Create your account</h1>
      <p className="reg-subtitle">
        Join the most precise network for high-impact creators.
      </p>

      {/* OAuth Buttons */}
      <div className="reg-oauth-group">
        <AuthButton provider="google" label="Continue with Google" />
      </div>

      <div className="reg-divider">
        <span>or</span>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="reg-form">
        <div className="reg-row">
          <div className="reg-field">
            <label htmlFor="firstName">FIRST NAME</label>
            <input
              id="firstName"
              type="text"
              placeholder="Alex"
              autoComplete="given-name"
              {...register("firstName")}
              className={errors.firstName ? "error" : ""}
            />
            {errors.firstName && (
              <span className="reg-error">{errors.firstName.message}</span>
            )}
          </div>
          <div className="reg-field">
            <label htmlFor="lastName">LAST NAME</label>
            <input
              id="lastName"
              type="text"
              placeholder="Rivera"
              autoComplete="family-name"
              {...register("lastName")}
              className={errors.lastName ? "error" : ""}
            />
            {errors.lastName && (
              <span className="reg-error">{errors.lastName.message}</span>
            )}
          </div>
        </div>

        <div className="reg-field">
          <label htmlFor="email">EMAIL ADDRESS</label>
          <input
            id="email"
            type="email"
            placeholder="alex@kaampay.com"
            autoComplete="email"
            {...register("email")}
            className={errors.email ? "error" : ""}
          />
          {errors.email && (
            <span className="reg-error">{errors.email.message}</span>
          )}
        </div>

        <div className="reg-field">
          <label htmlFor="password">PASSWORD</label>
          <div className="reg-password-wrap">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••••••"
              autoComplete="new-password"
              {...register("password")}
              className={errors.password ? "error" : ""}
            />
            <button
              type="button"
              onClick={() => setShowPassword((p) => !p)}
              className="reg-eye-btn"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && (
            <span className="reg-error">{errors.password.message}</span>
          )}
        </div>

        <div className="reg-field">
          <label htmlFor="confirmPassword">CONFIRM PASSWORD</label>
          <div className="reg-password-wrap">
            <input
              id="confirmPassword"
              type={showConfirm ? "text" : "password"}
              placeholder="••••••••••••"
              autoComplete="new-password"
              {...register("confirmPassword")}
              className={errors.confirmPassword ? "error" : ""}
            />
            <button
              type="button"
              onClick={() => setShowConfirm((p) => !p)}
              className="reg-eye-btn"
              aria-label={showConfirm ? "Hide password" : "Show password"}
            >
              {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.confirmPassword && (
            <span className="reg-error">{errors.confirmPassword.message}</span>
          )}
        </div>

        {serverError && (
          <div className="reg-server-error">{serverError}</div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="reg-submit-btn"
          id="create-account-btn"
        >
          {isSubmitting ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            "Create Account"
          )}
        </button>
      </form>

      <p className="reg-signin-link">
        Already have an account?{" "}
        <Link href="/login" className="text-[--primary] font-semibold hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
