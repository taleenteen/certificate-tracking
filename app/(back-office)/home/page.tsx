'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth";
import { HomeDashboard } from "@/components/back-office/home-dashboard";

export default function BackOfficeHomePage() {
  const user = useAuthStore((s) => s.user);
  const router = useRouter();

  useEffect(() => {
    if (user) {
      if (user.roles?.includes('admin') && !user.roles?.includes('super_admin')) {
        router.replace('/admin/inspections');
      }
    }
  }, [user, router]);

  return <HomeDashboard />;
}
