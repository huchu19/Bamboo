'use client';

import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { BambooLeaf } from "./BambooIcons";

export function RoleSwitcherChip() {
  const { role, devBypass, setDevRole } = useAuth();
  const router = useRouter();

  if (!role) return null;

  const isInvestor = role === "investor";
  const next = isInvestor ? "inventor" : "investor";

  const tone = isInvestor
    ? "text-[color:var(--gold)] ring-[color:var(--gold)]/40 hover:bg-[color:var(--gold)]/10"
    : "text-[color:var(--primary)] ring-[color:var(--primary)]/40 hover:bg-[color:var(--primary)]/10";

  const onClick = () => {
    if (!devBypass) return;
    const confirmed = window.confirm(
      `Switch to ${next === "investor" ? "Investor" : "Inventor"} mode?\n\n` +
        `You're currently in ${isInvestor ? "Investor" : "Inventor"} mode. ` +
        `Switching changes what you see across the app — dashboard, role indicator, and CTAs. ` +
        `You can switch back any time from the same chip.`,
    );
    if (!confirmed) return;
    setDevRole(next);
    router.push("/dashboard");
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!devBypass}
      title={devBypass ? `Swap to ${next} mode` : undefined}
      className={`hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full ring-1 font-display uppercase text-[10px] tracking-widest transition-all disabled:opacity-70 disabled:cursor-default ${tone}`}
    >
      <BambooLeaf size={11} />
      {isInvestor ? "Investor Mode" : "Inventor Mode"}
    </button>
  );
}
