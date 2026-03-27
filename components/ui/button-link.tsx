import { cn } from "@/lib/utils";

interface ButtonLinkShellProps {
  children: React.ReactNode;
  className?: string;
  variant?: "primary" | "secondary" | "light" | "ghost";
}

export function buttonLinkClassName({
  className,
  variant = "primary",
}: Omit<ButtonLinkShellProps, "children">) {
  return cn(
    "inline-flex min-h-12 items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition-transform duration-300 ease-out hover:-translate-y-0.5",
    variant === "primary" &&
      "bg-[#2c2722] text-white shadow-[0_12px_32px_rgba(35,32,28,0.22)] hover:bg-[#221d19]",
    variant === "secondary" &&
      "border border-[#2c2722]/20 bg-[#f7f3ee] text-[#2c2722] hover:border-[#2c2722]/35 hover:bg-[#f1ece5]",
    variant === "light" &&
      "border border-white/70 bg-[#f7f3ee] text-[#2c2722] shadow-[0_12px_28px_rgba(247,243,238,0.24)] hover:bg-white",
    variant === "ghost" && "text-[#2c2722] hover:text-[#1d1916]",
    className,
  );
}
