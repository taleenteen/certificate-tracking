"use client";
import type { StatusBadgeStatus } from "@/components/shared/StatusBadge";

import { SectionCard } from "@/components/shared/SectionCard";
import { ListItemCard } from "@/components/shared/ListItemCard";
import { NavigationFooter } from "@/components/shared/NavigationFooter";
import {
  MdOutlineDescription,
  MdOutlineEmail,
  MdOutlineHomeWork,
  MdOutlinePerson,
  MdOutlinePhone,
} from "react-icons/md";

export type EstablishmentDocument = {
  id: string;
  title: string;
  status: StatusBadgeStatus;
  expireDate?: string;
};

export type EstablishmentDetailData = {
  companyName: string;
  establishmentName: string;
  address: string;
  phoneNumber: string;
  email: string;
  documents: EstablishmentDocument[];
};

type EstablishmentPageDetailViewProps = {
  data: EstablishmentDetailData;
};

export function EstablishmentPageDetailView({
  data,
}: EstablishmentPageDetailViewProps) {
  return (
    <>
      <main className="min-h-[calc(100vh-57px)] bg-[#F9FAFB] px-4 py-4">
        <div className="mx-auto max-w-3xl">
          <SectionCard
            icon={<MdOutlineHomeWork className="h-5 w-5 text-slate-700" />}
            title="ข้อมูลสถานประกอบการ"
          >
            <p className="text-sm text-gray-600">
              ชื่อสถานประกอบการ
              <br />
              <span className="text-base text-slate-800">
                {data.establishmentName}
              </span>
            </p>
            <p className="text-sm text-gray-600">
              ที่ตั้ง
              <br />
              <span className="text-base text-slate-800">{data.address}</span>
            </p>
          </SectionCard>

          <SectionCard
            icon={<MdOutlineDescription className="h-5 w-5 text-slate-700" />}
            title="ข้อมูลใบอนุญาต"
          >
            <div className="flex justify-between px-1">
              <p className="text-slate-600">ใบอนุญาตทั้งหมด</p>
              <p className="text-slate-600">{data.documents.length} รายการ</p>
            </div>
            <div className="space-y-3">
              {data.documents.map((document) => (
                <ListItemCard
                  key={document.id}
                  title={document.title}
                  status={document.status}
                  expireDate={document.expireDate}
                />
              ))}
            </div>
          </SectionCard>

          <SectionCard
            icon={<MdOutlinePerson className="h-5 w-5 text-slate-700" />}
            title="ข้อมูลเจ้าของกิจการ"
          >
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">เบอร์โทรศัพท์</p>
                <div className="mt-1 flex items-center gap-2">
                  <MdOutlinePhone className="h-4 w-4 text-slate-700" />
                  <span className="text-base text-slate-800">
                    {data.phoneNumber}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600">อีเมล</p>
                <div className="mt-1 flex items-center gap-2">
                  <MdOutlineEmail className="h-4 w-4 text-slate-700" />
                  <span className="text-base text-slate-800">{data.email}</span>
                </div>
              </div>
            </div>
          </SectionCard>
        </div>
      </main>
      <footer>
        <NavigationFooter onNavigate={() => console.log("go map")} />
      </footer>
    </>
  );
}
