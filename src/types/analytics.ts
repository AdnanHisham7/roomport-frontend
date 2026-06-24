export interface DashboardMetrics {
  totalRevenue: number;
  occupancyRate: {
    totalUnits: number;
    occupiedUnits: number;
    vacantUnits: number;
    ratePercentage: number;
  };
  revenueByBuilding: { buildingId: string; revenue: number }[];
  recentlyRentedUnits: { unitId: string; buildingId: string; rentAmount: number; startDate: string }[];
  expiringAgreements: { agreementId: string; unitId: string; tenantId: string; endDate: string; monthlyRent: number }[];
}
