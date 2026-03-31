import { IAnalyticsRepository } from '../../domain/repository/analytics-repository-impl';
import { DashboardMetricsDTO } from '../../application/dtos/analytics/analytics.dto';
import { AgreementModel } from '../db/model/agreement-model';
import mongoose from 'mongoose';

export class AnalyticsRepository implements IAnalyticsRepository {
  async getDashboardMetrics(userId: string): Promise<DashboardMetricsDTO> {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // 1. Total Expected Monthly Revenue
    // Using completed agreements
    const revenueAgg = await AgreementModel.aggregate([
      { $match: { createdBy: userObjectId, status: 'completed' } },
      { $group: { _id: null, totalRevenue: { $sum: '$monthlyRent' } } }
    ]);
    const totalRevenue = revenueAgg[0]?.totalRevenue || 0;

    // 2. Revenue by Building
    const revenueByBuildingAgg = await AgreementModel.aggregate([
      { $match: { createdBy: userObjectId, status: 'completed' } },
      { $group: { _id: '$buildingId', revenue: { $sum: '$monthlyRent' } } },
      { $project: { _id: 0, buildingId: '$_id', revenue: 1 } }
    ]);

    // 3. Recently Rented Units (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentlyRentedUnits = await AgreementModel.find({
      createdBy: userId,
      status: 'completed',
      startDate: { $gte: thirtyDaysAgo }
    })
      .select('unitId buildingId monthlyRent startDate')
      .lean();

    // 4. Expiring Agreements (next 60 days)
    const sixtyDaysFromNow = new Date();
    sixtyDaysFromNow.setDate(sixtyDaysFromNow.getDate() + 60);
    const expiringAgreements = await AgreementModel.find({
      createdBy: userId,
      status: 'completed',
      endDate: { $gte: new Date(), $lte: sixtyDaysFromNow }
    })
      .select('_id unitId tenantId endDate monthlyRent')
      .lean();

    // 5. Occupancy metrics based on agreements
    // Since we don't have a direct user->unit mapping, we estimate from unique units in their agreements
    // (Or we can assume if they made an agreement on a unit, it belongs to them).
    // Let's count total distinct units in any agreement created by them
    const distinctUnits = await AgreementModel.distinct('unitId', { createdBy: userId });
    const totalUnitsCount = distinctUnits.length;
    
    // Occupied units = distinct units in currently completed and active agreements
    const occupiedUnitsList = await AgreementModel.distinct('unitId', { 
      createdBy: userId, 
      status: 'completed',
      endDate: { $gt: new Date() }
    });
    const occupiedUnitsCount = occupiedUnitsList.length;
    const vacantUnitsCount = Math.max(0, totalUnitsCount - occupiedUnitsCount);
    const ratePercentage = totalUnitsCount > 0 ? Math.round((occupiedUnitsCount / totalUnitsCount) * 100) : 0;

    return {
      totalRevenue,
      occupancyRate: {
        totalUnits: totalUnitsCount,
        occupiedUnits: occupiedUnitsCount,
        vacantUnits: vacantUnitsCount,
        ratePercentage
      },
      revenueByBuilding: revenueByBuildingAgg,
      recentlyRentedUnits: recentlyRentedUnits.map(a => ({
        unitId: a.unitId?.toString() || '',
        buildingId: a.buildingId?.toString() || '',
        rentAmount: a.monthlyRent,
        startDate: a.startDate
      })),
      expiringAgreements: expiringAgreements.map(a => ({
        agreementId: a._id.toString(),
        unitId: a.unitId?.toString() || '',
        tenantId: a.tenantId?.toString() || '',
        endDate: a.endDate,
        monthlyRent: a.monthlyRent
      }))
    };
  }
}
