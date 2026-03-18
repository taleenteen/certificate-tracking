import {
  ReportsPageView,
  type ReportItem,
} from "@/components/back-office/reports-page";

const mockReports: ReportItem[] = [
  {
    id: "report-1",
    companyName: "บริษัท ศิริพัฒนา โฮเทล แอนด์ เซอร์วิส จำกัด",
    businessType: "โรงแรม",
    inspectionDateTime: "10 มี.ค. 2567 - 09:00 น.",
    location: "กรุงเทพมหานคร, คลองสามวา",
    inspectorName: "นางสาววิภา ใจดี",
    category: "hotel",
    region: "กรุงเทพมหานคร",
    detailsHref: "/reports/1",
  },
  {
    id: "report-2",
    companyName: "โรงแรมริเวอร์ไซด์",
    businessType: "โรงแรม",
    inspectionDateTime: "10 มี.ค. 2567 - 09:00 น.",
    location: "กรุงเทพมหานคร, คลองสามวา",
    inspectorName: "นางสาววิภา ใจดี",
    category: "hotel",
    region: "กรุงเทพมหานคร",
    detailsHref: "/reports/2",
  },
  {
    id: "report-3",
    companyName: "ร้านอาหารบ้านนา",
    businessType: "โรงแรม",
    inspectionDateTime: "10 มี.ค. 2567 - 09:00 น.",
    location: "กรุงเทพมหานคร, คลองสามวา",
    inspectorName: "นางสาววิภา ใจดี",
    category: "hotel",
    region: "กรุงเทพมหานคร",
    detailsHref: "/reports/3",
  },
  {
    id: "report-4",
    companyName: "โรงพยาบาลวัฒนาเวช",
    businessType: "โรงพยาบาล",
    inspectionDateTime: "14 มี.ค. 2567 - 13:30 น.",
    location: "เชียงใหม่, เมืองเชียงใหม่",
    inspectorName: "นายธนกฤต แสงทอง",
    category: "hospital",
    region: "เชียงใหม่",
    detailsHref: "/reports/4",
  },
  {
    id: "report-5",
    companyName: "โรงงานไทยอุตสาหกรรม",
    businessType: "โรงงาน",
    inspectionDateTime: "15 มี.ค. 2567 - 10:15 น.",
    location: "ชลบุรี, ศรีราชา",
    inspectorName: "นางสาวกมลชนก พรหมมา",
    category: "factory",
    region: "ชลบุรี",
    detailsHref: "/reports/5",
  },
  {
    id: "report-6",
    companyName: "วิทยาลัยเทคโนโลยีการจัดการ",
    businessType: "สถานศึกษา",
    inspectionDateTime: "18 มี.ค. 2567 - 08:45 น.",
    location: "นครราชสีมา, เมืองนครราชสีมา",
    inspectorName: "นายปกรณ์ ศรีสุข",
    category: "education",
    region: "นครราชสีมา",
    detailsHref: "/reports/6",
  },
];

export default function ReportsPage() {
  return <ReportsPageView reports={mockReports} />;
}
