import type { Metadata } from "next";
import RegisterStepper from "@/app/ui/register/RegisterStepper";
import RightPanel from "@/app/ui/register/RightPanel";

export const metadata: Metadata = {
  title: "Create Account — KaamPay",
  description:
    "Join KaamPay — India's micro-freelancing platform for students, creators, and businesses.",
};

export default function RegisterPage() {
  return (
    <main className="register-layout">
      <RegisterStepper />
      <RightPanel />
    </main>
  );
}
