import mongoose from 'mongoose';
import { IAnalyticsRepository } from '../../domain/repository/analytics-repository-impl';
import { DashboardMetricsDTO } from '../../application/dtos/analytics/analytics.dto';
import { AgreementModel } from '../db/model/agreement-model';
import { PaymentRecordModel } from '../db/model/payment-record-model';
import { TenantModel } from '../db/model/tenant-model';
import { UnitModel } from '../db/model/unit-model';
import { BuildingModel } from '../db/model/building-model';

export class AnalyticsRepository implements IAnalyticsRepository {
  async getDashboardMetrics(userId: string): Promise<DashboardMetricsDTO> {
    const userObjectId  = new mongoose.Types.ObjectId(userId);
    // Cast to any to resolve Mongoose schema-field string vs ObjectId type conflicts
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const anyFilter = (f: object) => f as any;

    const buildings     = await BuildingModel.find(anyFilter({ ownerId: userObjectId })).lean();
    const buildingOids  = buildings.map(b => b._id);
    const buildingIdStrs = buildings.map(b => b._id.toString());
    const buildingNameMap = new Map(buildings.map(b => [b._id.toString(), b.name]));

    // Aggregations use ObjectIds (correct for Mongoose aggregate which bypasses the schema type layer)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const agg = async (model: any, pipeline: object[]): Promise<any[]> => model.aggregate(anyFilter(pipeline));

    const [revenueAgg]   = await agg(PaymentRecordModel, [
      { $match: { buildingId: { $in: buildingOids }, status: 'paid' } },
      { $group: { _id: null, totalRevenue: { $sum: '$amount' } } },
    ]);
    const [pendingAgg]   = await agg(PaymentRecordModel, [
      { $match: { buildingId: { $in: buildingOids }, status: { $in: ['pending', 'overdue'] } } },
      { $group: { _id: null, pendingRevenue: { $sum: '$amount' } } },
    ]);
    const revenueByBuildingAgg = await agg(PaymentRecordModel, [
      { $match: { buildingId: { $in: buildingOids }, status: 'paid' } },
      { $group: { _id: '$buildingId', revenue: { $sum: '$amount' } } },
      { $project: { _id: 0, buildingId: '$_id', revenue: 1 } },
    ]);

    // Regular finds use string IDs to match schema typing
    const allUnits       = await UnitModel.find(anyFilter({ buildingId: { $in: buildingIdStrs } })).lean();
    const totalUnits     = allUnits.length;
    const occupiedUnits  = allUnits.filter(u => u.isOccupied || u.status === 'occupied').length;
    const vacantUnits    = Math.max(0, totalUnits - occupiedUnits);
    const ratePercentage = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0;

    const thirtyDaysAgo   = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysFromNow = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);

    const recentlyRentedUnits = await AgreementModel.find(anyFilter({
      createdBy: userObjectId,
      status:    'completed',
      startDate: { $gte: thirtyDaysAgo },
    })).select('unitId buildingId monthlyRent startDate').lean();

    const expiringAgreements = await AgreementModel.find(anyFilter({
      createdBy: userObjectId,
      status:    'completed',
      endDate:   { $gte: new Date(), $lte: sixtyDaysFromNow },
    })).select('_id unitId tenantId endDate monthlyRent').lean();

    const pendingPayments = await PaymentRecordModel.find(anyFilter({
      buildingId: { $in: buildingIdStrs },
      status:     { $in: ['pending', 'overdue'] },
    })).sort({ createdAt: -1 }).limit(20).lean();

    const recentTxns = await PaymentRecordModel.find(anyFilter({
      buildingId: { $in: buildingIdStrs },
      status:     'paid',
    })).sort({ paidAt: -1 }).limit(50).lean();

    const allUnitIds = [...new Set([
      ...pendingPayments.map(p => p.unitId?.toString()).filter(Boolean),
      ...recentTxns.map(t => t.unitId?.toString()).filter(Boolean),
    ])];
    const units   = await UnitModel.find(anyFilter({ _id: { $in: allUnitIds } })).lean();
    const unitMap = new Map(units.map(u => [u._id.toString(), u.unitNumber]));

    const tenantIds = [...new Set(pendingPayments.map(p => p.tenantId?.toString()).filter(Boolean))];
    const tenants   = await TenantModel.find(anyFilter({ _id: { $in: tenantIds } })).lean();
    const tenantMap = new Map(tenants.map(t => [t._id.toString(), `${t.firstName} ${t.lastName}`]));

    const txnTenantIds = [...new Set(recentTxns.map(t => t.tenantId?.toString()).filter(Boolean))];
    const txnTenants   = await TenantModel.find(anyFilter({ _id: { $in: txnTenantIds } })).lean();
    const txnTenantMap = new Map(txnTenants.map(t => [t._id.toString(), `${t.firstName} ${t.lastName}`]));

    return {
      totalRevenue:    revenueAgg?.totalRevenue  ?? 0,
      pendingRevenue:  pendingAgg?.pendingRevenue ?? 0,
      occupancyRate:   { totalUnits, occupiedUnits, vacantUnits, ratePercentage },
      revenueByBuilding: revenueByBuildingAgg,
      recentlyRentedUnits: recentlyRentedUnits.map(a => ({
        unitId:     a.unitId?.toString()     ?? '',
        buildingId: a.buildingId?.toString() ?? '',
        rentAmount: a.monthlyRent,
        startDate:  a.startDate,
      })),
      expiringAgreements: expiringAgreements.map(a => ({
        agreementId: a._id.toString(),
        unitId:      a.unitId?.toString()  ?? '',
        tenantId:    a.tenantId?.toString() ?? '',
        endDate:     a.endDate,
        monthlyRent: a.monthlyRent,
      })),
      pendingPayments: pendingPayments.map(p => ({
        tenantId:    p.tenantId?.toString() ?? '',
        tenantName:  tenantMap.get(p.tenantId?.toString() ?? '') ?? 'Unknown',
        unitId:      p.unitId?.toString(),
        amount:      p.amount,
        periodLabel: p.periodLabel,
      })),
      recentTransactions: recentTxns.map(t => ({
        _id:          t._id.toString(),
        tenantId:     t.tenantId?.toString()   ?? '',
        tenantName:   txnTenantMap.get(t.tenantId?.toString() ?? '') ?? 'Unknown',
        buildingId:   t.buildingId?.toString() ?? '',
        buildingName: buildingNameMap.get(t.buildingId?.toString() ?? ''),
        unitId:       t.unitId?.toString(),
        unitNumber:   unitMap.get(t.unitId?.toString() ?? ''),
        periodLabel:  t.periodLabel,
        periodStart:  t.periodStart,
        periodEnd:    t.periodEnd,
        amount:       t.amount,
        status:       t.status,
        paidAt:       t.paidAt,
        method:       t.method,
        notes:        t.notes,
        createdAt:    t.createdAt,
      })),
    };
  }
}
