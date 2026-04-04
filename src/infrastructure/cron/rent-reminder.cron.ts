import cron from 'node-cron';
import { TenantRepository } from '../repository/tenant-repository';
import { BuildingRepository } from '../repository/building-repository';
import { UserRepository } from '../repository/user-repository';
import { EmailService } from '../services/email-service';

export function startRentReminderCron() {
  const tenantRepo = new TenantRepository();
  const buildingRepo = new BuildingRepository();
  const userRepo = new UserRepository();
  const emailService = new EmailService();

  // Run automatically every day at 08:00 AM server time
  cron.schedule('0 8 * * *', async () => {
    console.log('[Cron] Executing daily rent reminders rule module...');
    try {
      const activeTenants = await tenantRepo.findAll({ status: 'active' } as any);
      const today = new Date();
      const currentDay = today.getDate();

      for (const tenant of activeTenants) {
        if (!tenant.email) continue;
        
        const dueDate = tenant.dueDate;
        let daysUntilDue = dueDate - currentDay;

        // If the difference pushes past end of month boundaries, 
        // a robust approach usually calculates diff between exact next Due Date and Today.
        // For simplicity, we just compare the raw numeric Day of the Month right now.
        
        let title = '';
        let message = '';
        let send = false;

        if (daysUntilDue === 3) {
          title = 'Rent Reminder: Payment Due within 3 Days';
          message = `Hi ${tenant.firstName}, your rent amount of $${tenant.rentAmount} is due in 3 days on the ${dueDate}th.`;
          send = true;
        } 
        else if (daysUntilDue === 0) {
          title = 'Rent Due Today';
          message = `Hi ${tenant.firstName}, your rent amount of $${tenant.rentAmount} is due today, the ${dueDate}th.`;
          send = true;
        } 
        else if (daysUntilDue === -3) {
          // Check if it's already paid inside this month.
          const hasPaidThisMonth = tenant.paidAt && 
               tenant.paidAt.getMonth() === today.getMonth() && 
               tenant.paidAt.getFullYear() === today.getFullYear();
          
          if (!hasPaidThisMonth) {
            title = 'OVERDUE: Rent Payment Required';
            message = `Hi ${tenant.firstName}, your rent is currently 3 days OVERDUE. Please fulfill your $${tenant.rentAmount} payment immediately.`;
            send = true;
          }
        }

        if (send) {
          // Notify the Tenant
          await emailService.sendNotificationEmail(tenant.email, title, message).catch(console.error);

          // Find Admin Email to copy them
          if (tenant.buildingId) {
             const building = await buildingRepo.findById(tenant.buildingId);
             if (building && building.ownerId) {
                const admin = await userRepo.findById(building.ownerId as string);
                if (admin && admin.email) {
                   await emailService.sendNotificationEmail(
                      admin.email, 
                      `[ADMIN COPY] Action Sent to Tenant: ${title}`, 
                      `You are receiving a copy of a rent notification sent to tenant ${tenant.firstName} ${tenant.lastName} (${tenant.email}).\n\nOriginal Message:\n${message}`
                   ).catch(console.error);
                }
             }
          }
        }
      }
    } catch (e) {
      console.error('[Cron Error] Rent Reminder Script Failed:', e);
    }
  });

  console.log('[Cron] Rent Reminder Cron Job safely registered (Target: daily 08:00 AM).');
}
