import { IAnalyticsRepository } from '../../domain/repository/analytics-repository-impl';
import { DashboardMetricsDTO } from '../../application/dtos/analytics/analytics.dto';
import { AgreementModel } from '../db/model/agreement-model';
import { PaymentRecordModel } from '../db/model/payment-record-model';
import { TenantModel } from '../db/model/tenant-model';
import { UnitModel } from '../db/model/unit-model';
import { BuildingModel } from '../db/model/building-model';
import mongoose from 'mongoose';

export class AnalyticsRepository implements IAnalyticsRepository {
  async getDashboardMetrics(userId: string): Promise<DashboardMetricsDTO> {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Get buildings owned by this user
    const buildings = await BuildingModel.find({ ownerId: userObjectId }).lean();
    const buildingIds = buildings.map(b => b._id);
    const buildingNameMap = new Map(buildings.map(b => [b._id.toString(), b.name]));

    // 1. Total revenue from paid PaymentRecords
    const revenueAgg = await PaymentRecordModel.aggregate([
      { $match: { buildingId: { $in: buildingIds }, status: 'paid' } },
      { $group: { _id: null, totalRevenue: { $sum: '$amount' } } },
    ]);
    const totalRevenue = revenueAgg[0]?.totalRevenue ?? 0;

    // 2. Pending revenue
    const pendingAgg = await PaymentRecordModel.aggregate([
      { $match: { buildingId: { $in: buildingIds }, status: { $in: ['pending', 'overdue'] } } },
      { $group: { _id: null, pendingRevenue: { $sum: '$amount' } } },
    ]);
    const pendingRevenue = pendingAgg[0]?.pendingRevenue ?? 0;

    // 3. Revenue by building
    const revenueByBuildingAgg = await PaymentRecordModel.aggregate([
      { $match: { buildingId: { $in: buildingIds }, status: 'paid' } },
      { $group: { _id: '$buildingId', revenue: { $sum: '$amount' } } },
      { $project: { _id: 0, buildingId: '$_id', revenue: 1 } },
    ]);

    // 4. Occupancy from units
    const allUnits = await UnitModel.find({ buildingId: { $in: buildingIds } }).lean();
    const totalUnits    = allUnits.length;
    const occupiedUnits = allUnits.filter(u => u.isOccupied || u.status === 'occupied').length;
    const vacantUnits   = Math.max(0, totalUnits - occupiedUnits);
    const ratePercentage = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0;

    // 5. Recently rented units (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentlyRentedUnits = await AgreementModel.find({
      createdBy: userObjectId,
      status: 'completed',
      startDate: { $gte: thirtyDaysAgo },
    }).select('unitId buildingId monthlyRent startDate').lean();

    // 6. Expiring agreements
    const sixtyDaysFromNow = new Date();
    sixtyDaysFromNow.setDate(sixtyDaysFromNow.getDate() + 60);
    const expiringAgreements = await AgreementModel.find({
      createdBy: userObjectId,
      status: 'completed',
      endDate: { $gte: new Date(), $lte: sixtyDaysFromNow },
    }).select('_id unitId tenantId endDate monthlyRent').lean();

    // 7. Pending payments (tenants with overdue/pending records)
    const pendingPayments = await PaymentRecordModel.find({
      buildingId: { $in: buildingIds },
      status: { $in: ['pending', 'overdue'] },
    }).sort({ createdAt: -1 }).limit(20).lean();

    // 8. Recent transactions
    const recentTxns = await PaymentRecordModel.find({
      buildingId: { $in: buildingIds },
      status: 'paid',
    }).sort({ paidAt: -1 }).limit(50).lean();

    // ─── FIX: Collect unique unit IDs from BOTH arrays ───────────────────
    const pendingUnitIds = pendingPayments.map(p => p.unitId?.toString()).filter(Boolean);
    const txnUnitIds = recentTxns.map(t => t.unitId?.toString()).filter(Boolean);
    const allUnitIds = [...new Set([...pendingUnitIds, ...txnUnitIds])];

    const units = await UnitModel.find({ _id: { $in: allUnitIds } }).lean();
    const unitMap = new Map(units.map(u => [u._id.toString(), u.unitNumber]));
    // ─────────────────────────────────────────────────────────────────────

    const tenantIds = [...new Set(pendingPayments.map(p => p.tenantId?.toString()))];
    const tenants   = await TenantModel.find({ _id: { $in: tenantIds } }).lean();
    const tenantMap = new Map(tenants.map(t => [t._id.toString(), `${t.firstName} ${t.lastName}`]));

    const pendingPaymentsList = pendingPayments.map(p => ({
      tenantId:    p.tenantId?.toString() ?? '',
      tenantName:  tenantMap.get(p.tenantId?.toString() ?? '') ?? 'Unknown',
      unitId:      p.unitId?.toString(),
      amount:      p.amount,
      periodLabel: p.periodLabel,
    }));

    const txnTenantIds = [...new Set(recentTxns.map(t => t.tenantId?.toString()))];
    const txnTenants   = await TenantModel.find({ _id: { $in: txnTenantIds } }).lean();
    const txnTenantMap = new Map(txnTenants.map(t => [t._id.toString(), `${t.firstName} ${t.lastName}`]));

    const recentTransactions = recentTxns.map(t => ({
      _id:          t._id.toString(),
      tenantId:      t.tenantId?.toString() ?? '',
      tenantName:    txnTenantMap.get(t.tenantId?.toString() ?? '') ?? 'Unknown',
      buildingId:    t.buildingId?.toString() ?? '',
      buildingName: buildingNameMap.get(t.buildingId?.toString() ?? ''),
      unitId:        t.unitId?.toString(),
      unitNumber:    unitMap.get(t.unitId?.toString() ?? ''), // Will now correctly resolve
      periodLabel:  t.periodLabel,
      periodStart:  t.periodStart,
      periodEnd:    t.periodEnd,
      amount:        t.amount,
      status:        t.status,
      paidAt:        t.paidAt,
      method:        t.method,
      notes:         t.notes,
      createdAt:     t.createdAt,
    }));

    return {
      totalRevenue,
      pendingRevenue,
      occupancyRate: { totalUnits, occupiedUnits, vacantUnits, ratePercentage },
      revenueByBuilding: revenueByBuildingAgg,
      recentlyRentedUnits: recentlyRentedUnits.map(a => ({
        unitId:     a.unitId?.toString() ?? '',
        buildingId: a.buildingId?.toString() ?? '',
        rentAmount: a.monthlyRent,
        startDate:  a.startDate,
      })),
      expiringAgreements: expiringAgreements.map(a => ({
        agreementId: a._id.toString(),
        unitId:      a.unitId?.toString() ?? '',
        tenantId:    a.tenantId?.toString() ?? '',
        endDate:     a.endDate,
        monthlyRent: a.monthlyRent,
      })),
      pendingPayments: pendingPaymentsList,
      recentTransactions,
    };
  }
}
