"use client";

import { useLogin } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Eye, EyeOff, KeyRound, ShieldCheck, User } from "lucide-react";

const isDev = process.env.NEXT_PUBLIC_ENV === "development";

export function LoginForm({ onToggle }: { onToggle: () => void }) {
  const login = useLogin();
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [adminMode, setAdminMode] = useState(false);
  const [adminData, setAdminData] = useState({
    username: "",
    password: "",
    totpCode: isDev ? "000000" : "",
  });
  const [showAdminPassword, setShowAdminPassword] = useState(false);

  const handlePasswordLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login.mutate({ type: "password", ...formData });
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login.mutate({ type: "self", ...adminData });
  };

  const handleTangRatLogin = () => {
    const tangRatUrl = process.env.NEXT_PUBLIC_IAM_GOV_FRONTEND_URL;
    if (tangRatUrl && !isDev) {
      window.location.href = tangRatUrl;
    } else {
      login.mutate({ type: "tang-rat", mToken: "mock-public-owner" });
    }
  };

  if (adminMode) {
    return (
      <div className="p-6 space-y-5">
        {/* Admin mode header */}
        <div className="flex items-center gap-3 pb-1">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-100">
            <ShieldCheck className="h-5 w-5 text-purple-600" />
          </span>
          <div>
            <p className="text-sm font-bold text-slate-900">
              เข้าสู่ระบบเจ้าหน้าที่
            </p>
            <p className="text-xs text-slate-500">
              Admin / Super Admin ต้องใช้รหัส OTP
            </p>
          </div>
        </div>

        <div className="h-px bg-slate-100" />

        <form onSubmit={handleAdminLogin} className="space-y-4">
          <div className="space-y-1.5">
            <Label
              htmlFor="admin-username"
              className="text-xs font-semibold text-slate-600 uppercase tracking-wide"
            >
              ชื่อผู้ใช้งาน
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                id="admin-username"
                placeholder="เช่น superadmin"
                required
                autoComplete="username"
                value={adminData.username}
                onChange={(e) =>
                  setAdminData({ ...adminData, username: e.target.value })
                }
                className="pl-9 h-11 rounded-xl border-slate-200 bg-slate-50 focus:bg-white"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="admin-password"
              className="text-xs font-semibold text-slate-600 uppercase tracking-wide"
            >
              รหัสผ่าน
            </Label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                id="admin-password"
                type={showAdminPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                value={adminData.password}
                onChange={(e) =>
                  setAdminData({ ...adminData, password: e.target.value })
                }
                className="pl-9 pr-10 h-11 rounded-xl border-slate-200 bg-slate-50 focus:bg-white"
              />
              <button
                type="button"
                onClick={() => setShowAdminPassword(!showAdminPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showAdminPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="totp"
              className="text-xs font-semibold text-slate-600 uppercase tracking-wide flex items-center gap-2"
            >
              รหัส OTP (6 หลัก)
              {isDev && (
                <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700 normal-case tracking-normal">
                  dev: 000000
                </span>
              )}
            </Label>
            <Input
              id="totp"
              inputMode="numeric"
              maxLength={6}
              pattern="\d{6}"
              placeholder="000000"
              required
              value={adminData.totpCode}
              onChange={(e) =>
                setAdminData({
                  ...adminData,
                  totpCode: e.target.value.replace(/\D/g, "").slice(0, 6),
                })
              }
              className="h-11 rounded-xl border-slate-200 bg-slate-50 focus:bg-white font-mono tracking-[0.5em] text-center text-lg"
            />
          </div>

          {login.isError && (
            <p className="text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2 text-center">
              {login.error instanceof Error
                ? login.error.message
                : "ข้อมูลไม่ถูกต้อง"}
            </p>
          )}

          <Button
            type="submit"
            className="w-full h-11 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-sm"
            disabled={login.isPending}
          >
            {login.isPending ? "กำลังตรวจสอบ..." : "เข้าสู่ระบบเจ้าหน้าที่"}
          </Button>
        </form>

        {/* Dev fill */}
        {isDev && (
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-500 space-y-1">
            <p className="font-semibold text-slate-600">บัญชีทดสอบ</p>
            <button
              type="button"
              onClick={() =>
                setAdminData({
                  username: "superadmin",
                  password: "ChangeMe-2026!",
                  totpCode: "000000",
                })
              }
              className="block w-full text-left rounded-lg px-2 py-1 hover:bg-slate-100 font-mono text-[11px]"
            >
              superadmin / ChangeMe-2026! / 000000
            </button>
          </div>
        )}

        <button
          type="button"
          onClick={() => setAdminMode(false)}
          className="w-full text-center text-xs text-slate-400 hover:text-slate-600 font-medium transition-colors"
        >
          ← กลับหน้าเข้าสู่ระบบปกติ
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-5">
      {/* Tang Rat / Digital ID */}
      <Button
        type="button"
        className="w-full h-12 rounded-xl bg-[#1a2a80] hover:bg-[#151f66] text-white font-semibold text-sm flex items-center justify-center gap-2.5 shadow-sm"
        // onClick={handleTangRatLogin}
        disabled={login.isPending}
      >
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-[#1a2a80] font-extrabold text-[10px]">
          ทาง
        </span>
        เข้าสู่ระบบด้วย ทางรัฐ (Digital ID)
      </Button>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <span className="flex-1 h-px bg-slate-200" />
        <span className="text-xs text-slate-400 font-medium">
          หรือเข้าสู่ระบบด้วยบัญชี
        </span>
        <span className="flex-1 h-px bg-slate-200" />
      </div>

      {/* Password login form */}
      <form onSubmit={handlePasswordLogin} className="space-y-4">
        <div className="space-y-1.5">
          <Label
            htmlFor="username"
            className="text-xs font-semibold text-slate-600 uppercase tracking-wide"
          >
            ชื่อผู้ใช้ หรือ อีเมล
          </Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              id="username"
              placeholder="username หรือ email@example.com"
              required
              autoComplete="username"
              value={formData.username}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
              className="pl-9 h-11 rounded-xl border-slate-200 bg-slate-50 focus:bg-white"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label
            htmlFor="password"
            className="text-xs font-semibold text-slate-600 uppercase tracking-wide"
          >
            รหัสผ่าน
          </Label>
          <div className="relative">
            <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              autoComplete="current-password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className="pl-9 pr-10 h-11 rounded-xl border-slate-200 bg-slate-50 focus:bg-white"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {login.isError && (
          <p className="text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2 text-center">
            {login.error instanceof Error
              ? login.error.message
              : "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง"}
          </p>
        )}

        <Button
          type="submit"
          className="w-full h-11 rounded-xl bg-[#1e7d55] hover:bg-[#186647] text-white font-semibold text-sm"
          disabled={login.isPending}
        >
          {login.isPending ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
        </Button>
      </form>

      {/* Dev fill */}
      {isDev && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-500 space-y-1">
          <p className="font-semibold text-slate-600">บัญชีทดสอบ</p>
          <button
            type="button"
            onClick={() =>
              setFormData({ username: "public-owner", password: "password" })
            }
            className="block w-full text-left rounded-lg px-2 py-1 hover:bg-slate-100 font-mono text-[11px]"
          >
            public-owner / password
          </button>
          <button
            type="button"
            onClick={() =>
              setFormData({ username: "officer-login", password: "password" })
            }
            className="block w-full text-left rounded-lg px-2 py-1 hover:bg-slate-100 font-mono text-[11px]"
          >
            officer-login / password
          </button>
        </div>
      )}

      <div className="h-px bg-slate-100" />

      {/* Bottom links */}
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>
          ยังไม่มีบัญชี?{" "}
          <button
            type="button"
            onClick={onToggle}
            className="font-semibold text-[#1e7d55] hover:underline"
          >
            สมัครสมาชิก
          </button>
        </span>
        <button
          type="button"
          onClick={() => setAdminMode(true)}
          className="flex items-center gap-1 text-slate-400 hover:text-purple-600 font-medium transition-colors"
        >
          <ShieldCheck className="h-3.5 w-3.5" />
          เจ้าหน้าที่
        </button>
      </div>
    </div>
  );
}
