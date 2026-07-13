"use client";

import { useFormStatus } from "react-dom";

type ActionSubmitButtonProps = {
  children: string;
  pendingLabel: string;
  disabled?: boolean;
  formAction?: (formData: FormData) => void | Promise<void>;
  variant?: "primary" | "dark" | "secondary";
};

const variantStyles = {
  primary:
    "bg-clean-green-700 text-white hover:bg-clean-green-900 disabled:bg-slate-200 disabled:text-slate-500",
  dark: "bg-slate-950 text-white hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-500",
  secondary:
    "border border-slate-300 bg-white text-slate-900 hover:bg-slate-50 disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400",
};

export function ActionSubmitButton({
  children,
  pendingLabel,
  disabled = false,
  formAction,
  variant = "primary",
}: ActionSubmitButtonProps) {
  const { pending } = useFormStatus();
  const isDisabled = disabled || pending;

  return (
    <button
      type="submit"
      formAction={formAction}
      disabled={isDisabled}
      aria-busy={pending}
      className={`inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed ${variantStyles[variant]}`}
    >
      {pending ? pendingLabel : children}
    </button>
  );
}
