export interface Inspector {
  id: string;
  name: string;
}

export interface InspectionTask {
  id: string; // e.g. INS-0001
  licenseNo: string;
  licenseType: string;
  operatorName: string;
  assignee: Inspector | null;
  inspectionDate: string; // dd/mm/yyyy
  status: 'ASSIGNED' | 'IN_PROGRESS' | 'WAITING_ASSIGNMENT' | 'COMPLETED' | 'CANCELLED';
}

export const MOCK_OFFICERS: Inspector[] = [
  { id: 'off-001', name: 'สมหมาย กล้าหาญ' },
  { id: 'off-002', name: 'วารี สุขสม' },
  { id: 'off-003', name: 'ประพัทธ์ ศรีวงศ์' },
  { id: 'off-004', name: 'ชาญชัย ตามรัตน์' },
];

export const MOCK_INSPECTIONS: InspectionTask[] = [
  {
    id: 'INS-0001',
    licenseNo: 'รง.4/2568/00123',
    licenseType: 'รง.4',
    operatorName: 'บริษัท ไทยโลหะ จำกัด',
    assignee: MOCK_OFFICERS[0], // สมหมาย กล้าหาญ
    inspectionDate: '28/06/2568',
    status: 'ASSIGNED',
  },
  {
    id: 'INS-0002',
    licenseNo: 'วอ./2568/00456',
    licenseType: 'วัตถุอันตราย',
    operatorName: 'ห้างหุ้นส่วน เคมีภัณฑ์ไทย',
    assignee: MOCK_OFFICERS[1], // วารี สุขสม
    inspectionDate: '21/06/2568',
    status: 'IN_PROGRESS',
  },
  {
    id: 'INS-0003',
    licenseNo: 'รง.4/2568/00789',
    licenseType: 'รง.4',
    operatorName: 'บริษัท สหอุตสาหกรรม จำกัด',
    assignee: MOCK_OFFICERS[2], // ประพัทธ์ ศรีวงศ์
    inspectionDate: '22/06/2568',
    status: 'WAITING_ASSIGNMENT',
  },
  {
    id: 'INS-0004',
    licenseNo: 'วอ./2568/00321',
    licenseType: 'วัตถุอันตราย',
    operatorName: 'บริษัท เพชรเคมี จำกัด',
    assignee: MOCK_OFFICERS[3], // ชาญชัย ตามรัตน์
    inspectionDate: '18/06/2568',
    status: 'COMPLETED',
  },
  {
    id: 'INS-0005',
    licenseNo: 'รง.4/2568/00654',
    licenseType: 'รง.4',
    operatorName: 'บริษัท คลองโรงงาน จำกัด',
    assignee: null, // ยังไม่ได้มอบหมาย
    inspectionDate: '25/06/2568',
    status: 'WAITING_ASSIGNMENT',
  },
  {
    id: 'INS-0006',
    licenseNo: 'วอ./2568/00987',
    licenseType: 'วัตถุอันตราย',
    operatorName: 'ห้างหุ้นส่วน ไทยอุตส่าห์',
    assignee: MOCK_OFFICERS[1], // วารี สุขสม
    inspectionDate: '15/06/2568',
    status: 'CANCELLED',
  },
];
