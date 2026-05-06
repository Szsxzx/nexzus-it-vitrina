"use client";
import { createContext, useContext } from "react";
import type { User } from "@/lib/types";

export interface AdminAuthCtxValue {
  user: User;
  logout: () => void;
}

export const AdminAuthContext = createContext<AdminAuthCtxValue | null>(null);

export function useAdminAuth(): AdminAuthCtxValue {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used inside admin layout");
  return ctx;
}
