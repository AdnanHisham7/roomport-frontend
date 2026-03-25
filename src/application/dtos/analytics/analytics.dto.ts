export interface DashboardMetricsDTO {
  totalRevenue: number;
  occupancyRate: {
    totalUnits: number;
    occupiedUnits: number;
    vacantUnits: number;
    ratePercentage: number;
  };
  revenueByBuilding: Array<{
    buildingId: string;
    revenue: number;
  }>;
  recentlyRentedUnits: Array<{
    unitId: string;
    buildingId: string;
    rentAmount: number;
    startDate: Date;
  }>;
  expiringAgreements: Array<{
    agreementId: string;
    unitId: string;
    tenantId: string;
    endDate: Date;
    monthlyRent: number;
  }>;
}
