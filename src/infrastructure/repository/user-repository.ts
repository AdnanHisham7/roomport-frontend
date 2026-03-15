import type { IRole } from '../../domain/entities/Role';
import type { IUser } from '../../domain/entities/User';
import type { IUserRepository, IUserWithRole } from '../../domain/repository/user-repository-impl';
import { UserModel } from '../db/model/user-model';

export class UserRepository implements IUserRepository {

  // ── Helper ──────────────────────────────────────────────────────────────────
  private toStringId(doc: { _id: unknown }): string {
    return (doc._id as { toString(): string }).toString();
  }

  // ── create ──────────────────────────────────────────────────────────────────
  async create(
    data: Omit<IUser, '_id' | 'createdAt' | 'updatedAt'>
  ): Promise<IUser> {
    const doc = await UserModel.create(data);
    return { ...doc.toObject(), _id: this.toStringId(doc) };
  }

  // ── findByEmail ─────────────────────────────────────────────────────────────
  async findByEmail(email: string): Promise<IUser | null> {
    const doc = await UserModel
      .findOne({ email: email.toLowerCase() })
      .lean();
    if (!doc) return null;
    return { ...doc, _id: this.toStringId(doc) };
  }

  // ── findByEmailWithRole ─────────────────────────────────────────────────────
  async findByEmailWithRole(email: string): Promise<IUserWithRole | null> {
    const doc = await UserModel
      .findOne({ email: email.toLowerCase() })
      .populate<{ roleId: IRole & { _id: { toString(): string } } }>('roleId')
      .lean();

    if (!doc) return null;

    const role = doc.roleId as IRole & { _id: { toString(): string } };

    return {
      ...doc,
      _id:    this.toStringId(doc),
      roleId: role._id.toString(),
      role: {
        _id:          role._id.toString(),
        name:         role.name,
        description:  role.description,
        isSystemRole: role.isSystemRole,
      },
    };
  }

  // ── findById ────────────────────────────────────────────────────────────────
  async findById(id: string): Promise<IUser | null> {
    const doc = await UserModel.findById(id).lean();
    if (!doc) return null;
    return { ...doc, _id: this.toStringId(doc) };
  }

  // ── findAll ─────────────────────────────────────────────────────────────────
  async findAll(): Promise<IUser[]> {
    const docs = await UserModel.find().lean();
    return docs.map((d) => ({ ...d, _id: this.toStringId(d) }));
  }

  // ── updateOtp ───────────────────────────────────────────────────────────────
  async updateOtp(email: string, otp: string, otpExpiresAt: Date): Promise<void> {
    await UserModel.updateOne(
      { email: email.toLowerCase() },
      { $set: { otp, otpExpiresAt } }
    );
  }

  // ── clearOtp ────────────────────────────────────────────────────────────────
  async clearOtp(email: string): Promise<void> {
    await UserModel.updateOne(
      { email: email.toLowerCase() },
      { $set: { otp: null, otpExpiresAt: null } }
    );
  }

  // ── updatePassword ──────────────────────────────────────────────────────────
  async updatePassword(email: string, hashedPassword: string): Promise<void> {
    await UserModel.updateOne(
      { email: email.toLowerCase() },
      { $set: { password: hashedPassword } }
    );
  }

  // ── verifyEmail ─────────────────────────────────────────────────────────────
  async verifyEmail(email: string): Promise<void> {
    await UserModel.updateOne(
      { email: email.toLowerCase() },
      { $set: { isEmailVerified: true } }
    );
  }

  // ── updateRefreshToken ──────────────────────────────────────────────────────
  async updateRefreshToken(userId: string, hashedToken: string | null): Promise<void> {
    await UserModel.updateOne(
      { _id: userId },
      { $set: { refreshToken: hashedToken } }
    );
  }

  // ── updateLastLogin ─────────────────────────────────────────────────────────
  async updateLastLogin(userId: string): Promise<void> {
    await UserModel.updateOne(
      { _id: userId },
      { $set: { lastLoginAt: new Date() } }
    );
  }
}
