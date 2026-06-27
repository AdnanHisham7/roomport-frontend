export interface TransactionRecord {
  _id:         string;
  tenantId:    string;
  tenantName:  string;
  buildingId:  string;
  buildingName?: string;
  unitId?:     string;
  unitNumber?: string;
  periodLabel: string;
  periodStart: Date;
  periodEnd:   Date;
  amount:      number;
  status:      string;
  paidAt?:     Date;
  method?:     string;
  notes?:      string;
  createdAt?:  Date;
}

export interface DashboardMetricsDTO {
  totalRevenue: number;
  pendingRevenue: number;
  occupancyRate: {
    totalUnits:    number;
    occupiedUnits: number;
    vacantUnits:   number;
    ratePercentage: number;
  };
  revenueByBuilding: Array<{
    buildingId: string;
    revenue:    number;
  }>;
  recentlyRentedUnits: Array<{
    unitId:     string;
    buildingId: string;
    rentAmount: number;
    startDate:  Date;
  }>;
  expiringAgreements: Array<{
    agreementId: string;
    unitId:      string;
    tenantId:    string;
    endDate:     Date;
    monthlyRent: number;
  }>;
  pendingPayments: Array<{
    tenantId:    string;
    tenantName:  string;
    unitId?:     string;
    amount:      number;
    periodLabel: string;
    dueDate?:    Date;
  }>;
  recentTransactions: TransactionRecord[];
}
