import type { ReactNode } from "react";
import Link from "next/link";
import { ShieldCheck, UserRound } from "lucide-react";

export default function IndexPage() {
  return (
    <main className="min-h-screen bg-[#f4f5f7] px-4 py-6">
      <div className="mx-auto flex min-h-[calc(100vh-48px)] w-full max-w-md flex-col justify-center">
        <div className="mb-8 space-y-3 text-center">
          <p className="text-sm font-medium text-[#114e4b]">E-License Platform</p>
          <h1 className="text-2xl font-semibold text-slate-950">
            เลือกประเภทการเข้าใช้งาน
          </h1>
          <p className="text-sm leading-6 text-slate-600">
            กรุณาเลือกช่องทางที่ตรงกับการใช้งานของคุณ
          </p>
        </div>

        <div className="space-y-3">
          <EntryCard
            href="/home?entry=public"
            icon={<UserRound className="h-6 w-6" />}
            title="บุคคลธรรมดา"
            description="สำหรับประชาชนและผู้ประกอบการที่ต้องการตรวจสอบใบอนุญาตหรือข้อมูลธุรกิจ"
          />
          <EntryCard
            href="/home?entry=officer"
            icon={<ShieldCheck className="h-6 w-6" />}
            title="เจ้าหน้าที่"
            description="สำหรับเจ้าหน้าที่ตรวจที่ต้องการดูงานที่ได้รับมอบหมายและใช้งานภาคสนาม"
          />
        </div>
      </div>
    </main>
  );
}

function EntryCard({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-start gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#e8f2ef] text-[#114e4b]">
        {icon}
      </span>
      <span>
        <span className="block text-lg font-semibold text-slate-950">{title}</span>
        <span className="mt-1 block text-sm leading-6 text-slate-600">
          {description}
        </span>
      </span>
    </Link>
  );
}
