"use client";

import { useState } from "react";
import { setRole } from "@/app/lib/actions/auth";
import { useRouter } from "next/navigation";
import { Briefcase, ShoppingBag, Loader2, Check } from "lucide-react";

interface Props {
  email: string;
}

const roles = [
  {
    id: "freelancer" as const,
    label: "Freelancer",
    description: "I want to offer my skills and earn money on KaamPay.",
    icon: Briefcase,
    gradient: "from-[#4a4bd7] to-[#6d5bff]",
    checkColor: "text-[#4a4bd7]",
  },
  {
    id: "client" as const,
    label: "Client",
    description: "I want to hire talented creators for my projects.",
    icon: ShoppingBag,
    gradient: "from-[#842cd3] to-[#a855f7]",
    checkColor: "text-[#842cd3]",
  },
];

export default function StepRoleSelect({ email }: Props) {
  const [selected, setSelected] = useState<"client" | "freelancer" | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleContinue = async () => {
    if (!selected) {
      setError("Please select a role to continue.");
      return;
    }
    setLoading(true);
    setError(null);
    const result = await setRole(email, selected);
    setLoading(false);
    if (!result.success) {
      setError(result.error);
      return;
    }
    router.push("/dashboard");
  };

  return (
    <div className="reg-step">
      <div className="reg-brand">KaamPay</div>

      <h1 className="reg-title">How will you use KaamPay?</h1>
      <p className="reg-subtitle">
        Choose your role — you can always change it later from your settings.
      </p>

      <div className="role-cards">
        {roles.map((role) => {
          const Icon = role.icon;
          const isSelected = selected === role.id;

          return (
            <button
              key={role.id}
              id={`role-${role.id}`}
              type="button"
              onClick={() => { setSelected(role.id); setError(null); }}
              className={`role-card ${isSelected ? "selected" : ""}`}
              aria-pressed={isSelected}
            >
              {/* Icon circle */}
              <div className={`role-card-icon bg-gradient-to-br ${role.gradient}`}>
                <Icon size={24} strokeWidth={1.5} className="text-white" />
              </div>

              <div className="role-card-body">
                <p className="role-card-label">{role.label}</p>
                <p className="role-card-desc">{role.description}</p>
              </div>

              {/* Check indicator */}
              <div className={`role-card-check ${isSelected ? "visible" : ""}`}>
                <Check size={16} strokeWidth={2.5} />
              </div>
            </button>
          );
        })}
      </div>

      {error && <div className="reg-server-error">{error}</div>}

      <button
        onClick={handleContinue}
        disabled={loading || !selected}
        className="reg-submit-btn"
        id="set-role-btn"
      >
        {loading ? (
          <Loader2 size={18} className="animate-spin" />
        ) : (
          "Get Started →"
        )}
      </button>
    </div>
  );
}
