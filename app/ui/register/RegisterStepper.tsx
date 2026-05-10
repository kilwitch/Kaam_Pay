"use client";

import { useState } from "react";
import StepEmailPassword from "./StepEmailPassword";
import StepOTPVerify from "./StepOTPVerify";
import StepUsername from "./StepUsername";
import StepRoleSelect from "./StepRoleSelect";

type Step = "credentials" | "otp" | "username" | "role";

// Step progress dots
const STEPS: Step[] = ["credentials", "otp", "username", "role"];

export default function RegisterStepper() {
  const [step, setStep] = useState<Step>("credentials");
  const [email, setEmail] = useState<string>("");
  const [_username, setUsernameState] = useState<string>("");

  const currentIdx = STEPS.indexOf(step);

  return (
    <div className="register-left-panel">
      {/* Progress dots */}
      {step !== "credentials" && (
        <div className="reg-progress-dots" aria-label="Registration progress">
          {STEPS.map((s, i) => (
            <div
              key={s}
              className={`reg-dot ${i <= currentIdx ? "active" : ""} ${i < currentIdx ? "done" : ""}`}
              aria-current={s === step ? "step" : undefined}
            />
          ))}
        </div>
      )}

      {/* Steps */}
      <div className="reg-step-container">
        {step === "credentials" && (
          <StepEmailPassword
            onSuccess={(userEmail) => {
              setEmail(userEmail);
              setStep("otp");
            }}
          />
        )}

        {step === "otp" && (
          <StepOTPVerify
            email={email}
            onSuccess={() => setStep("username")}
          />
        )}

        {step === "username" && (
          <StepUsername
            email={email}
            onSuccess={(uname) => {
              setUsernameState(uname);
              setStep("role");
            }}
          />
        )}

        {step === "role" && (
          <StepRoleSelect email={email} />
        )}
      </div>
    </div>
  );
}
