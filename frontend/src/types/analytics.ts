export interface TransactionRecord {
  _id:          string;
  tenantId:     string;
  tenantName:   string;
  buildingId:   string;
  buildingName?: string;
  unitId?:      string;
  unitNumber?:  string;
  periodLabel:  string;
  periodStart:  string;
  periodEnd:    string;
  amount:       number;
  status:       string;
  paidAt?:      string;
  method?:      string;
  notes?:       string;
  createdAt?:   string;
}

export interface PendingPayment {
  tenantId:    string;
  tenantName:  string;
  unitId?:     string;
  amount:      number;
  periodLabel: string;
  dueDate?:    string;
}

export interface DashboardMetrics {
  totalRevenue:        number;
  pendingRevenue:      number;
  occupancyRate: {
    totalUnits:      number;
    occupiedUnits:   number;
    vacantUnits:     number;
    ratePercentage:  number;
  };
  revenueByBuilding:    { buildingId: string; revenue: number }[];
  recentlyRentedUnits:  { unitId: string; buildingId: string; rentAmount: number; startDate: string }[];
  expiringAgreements:   { agreementId: string; unitId: string; tenantId: string; endDate: string; monthlyRent: number }[];
  pendingPayments:      PendingPayment[];
  recentTransactions:   TransactionRecord[];
}
