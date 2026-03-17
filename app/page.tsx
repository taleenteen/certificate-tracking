import Link from "next/link";
import { Map } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#e2f3ff,transparent_40%),linear-gradient(180deg,#f8fbff_0%,#eef4f8_100%)] px-6 py-12">
      <div className="mx-auto flex min-h-[calc(100vh-6rem)] max-w-5xl flex-col justify-center gap-8">
        <div className="max-w-2xl space-y-4">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-sky-700">
            Clean Project Starter
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-6xl">
            พื้นที่เริ่มต้นใหม่สำหรับประกอบ UI จาก component ที่ต้องการ
          </h1>
          <p className="text-base leading-7 text-slate-600 sm:text-lg">
            โปรเจคนี้ถูกเคลียร์ให้เหลือแกนหลักของ Next.js, `shadcn/ui` และ
            custom map components เพื่อพร้อมนำไปขึ้นหน้าจอใหม่ต่อได้เลย
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button asChild size="lg" className="h-11 rounded-full px-6">
            <Link href="/map">
              <Map className="mr-2 h-4 w-4" />
              เปิดหน้าแผนที่
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
