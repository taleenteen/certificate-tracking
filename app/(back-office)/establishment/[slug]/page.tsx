import {
  EstablishmentPageDetailView,
  type EstablishmentDetailData,
} from "@/components/back-office/establishment-detail-page";

const mockEstablishmentDetail: EstablishmentDetailData = {
  companyName: "บริษัท เอส.เค.ดี จำกัด",
  establishmentName: "บริษัท ศิริพัฒนา โฮเทล แอนด์ เซอร์วิส จำกัด",
  address: "123 ถนนสุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพฯ 10110",
  phoneNumber: "02-123-4567",
  email: "contact@sawadee.com",
  documents: [
    {
      id: "license-1",
      title: "ใบอนุญาตประกอบกิจการ",
      status: "active",
      expireDate: "31 ธ.ค. 2569",
    },
    {
      id: "license-2",
      title: "ใบรับรองมาตรฐานสถานประกอบการ",
      status: "expiringSoon",
      expireDate: "15 เม.ย. 2569",
    },
  ],
};

export default function EstablishmentDetailPage() {
  return <EstablishmentPageDetailView data={mockEstablishmentDetail} />;
}
