"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { usernameSchema, type UsernameFormData } from "@/app/lib/validations";
import { setUsername } from "@/app/lib/actions/auth";
import { AtSign, Loader2 } from "lucide-react";
import { useState } from "react";

interface Props {
  email: string;
  onSuccess: (username: string) => void;
}

export default function StepUsername({ email, onSuccess }: Props) {
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<UsernameFormData>({
    resolver: zodResolver(usernameSchema),
  });

  const username = watch("username") ?? "";

  const onSubmit = async (data: UsernameFormData) => {
    setServerError(null);
    const result = await setUsername(email, data.username);
    if (!result.success) {
      setServerError(result.error);
      return;
    }
    onSuccess(data.username);
  };

  return (
    <div className="reg-step">
      <div className="reg-brand">KaamPay</div>

      <div className="otp-mail-icon">
        <AtSign size={28} strokeWidth={1.5} />
      </div>

      <h1 className="reg-title">Choose a username</h1>
      <p className="reg-subtitle">
        This is how other users will find and recognize you on KaamPay.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="reg-form">
        <div className="reg-field">
          <label htmlFor="username">USERNAME</label>
          <div className="reg-username-wrap">
            <span className="reg-username-prefix">@</span>
            <input
              id="username"
              type="text"
              placeholder="alex_rivera"
              autoComplete="username"
              spellCheck={false}
              {...register("username")}
              className={`reg-username-input ${errors.username ? "error" : ""}`}
            />
          </div>
          {errors.username ? (
            <span className="reg-error">{errors.username.message}</span>
          ) : username.length >= 3 ? (
            <span className="reg-hint">✓ Looks good!</span>
          ) : null}
        </div>

        {serverError && (
          <div className="reg-server-error">{serverError}</div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="reg-submit-btn"
          id="set-username-btn"
        >
          {isSubmitting ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            "Continue"
          )}
        </button>
      </form>
    </div>
  );
}
