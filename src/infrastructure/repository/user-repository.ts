import type { IUser } from '../../domain/entities/User';
import type { IUserRepository } from '../../domain/repository/user-repository-impl';
import { UserModel } from '../db/model/user-model';

export class UserRepository implements IUserRepository {

  private toStringId(doc: { _id: unknown }): string {
    return (doc._id as { toString(): string }).toString();
  }

  private toEntity(doc: any): IUser {
    const obj = doc.toObject ? doc.toObject() : { ...doc };
    return {
      ...obj,
      _id:            this.toStringId(obj),
      building_id:    obj.building_id?.toString()    ?? undefined,
      subscriptionId: obj.subscriptionId?.toString() ?? undefined,
    };
  }

  // ── findByEmail ──────────────────────────────────────────────────────────
  async findByEmail(email: string): Promise<IUser | null> {
    const doc = await UserModel.findOne({ email: email.toLowerCase() }).lean();
    if (!doc) return null;
    return this.toEntity(doc);
  }

  // ── findById ─────────────────────────────────────────────────────────────
  async findById(id: string): Promise<IUser | null> {
    const doc = await UserModel.findById(id).lean();
    if (!doc) return null;
    return this.toEntity(doc);
  }

  // ── findAll ──────────────────────────────────────────────────────────────
  async findAll(): Promise<IUser[]> {
    const docs = await UserModel.find().lean();
    return docs.map((d) => this.toEntity(d));
  }

  // ── create ───────────────────────────────────────────────────────────────
  async create(
    data: Omit<IUser, '_id' | 'createdAt' | 'updatedAt'>
  ): Promise<IUser> {
    const doc = await UserModel.create(data);
    return this.toEntity(doc);
  }

  // ── updateStatus ─────────────────────────────────────────────────────────
  async updateStatus(userId: string, status: IUser['status']): Promise<void> {
    await UserModel.updateOne({ _id: userId }, { $set: { status } });
  }

  // ── updateEmailVerified ───────────────────────────────────────────────────
  async updateEmailVerified(userId: string): Promise<void> {
    await UserModel.updateOne(
      { _id: userId },
      { $set: { email_verified: true, status: 'active' } }
    );
  }

  // ── updatePassword ────────────────────────────────────────────────────────
  async updatePassword(email: string, hashedPassword: string): Promise<void> {
    await UserModel.updateOne(
      { email: email.toLowerCase() },
      { $set: { password: hashedPassword } }
    );
  }

  // ── updateRefreshToken ────────────────────────────────────────────────────
  async updateRefreshToken(
    userId: string,
    hashedToken: string | null
  ): Promise<void> {
    await UserModel.updateOne(
      { _id: userId },
      { $set: { refresh_token: hashedToken } }
    );
  }

  // ── updateLastLogin ───────────────────────────────────────────────────────
  async updateLastLogin(userId: string): Promise<void> {
    await UserModel.updateOne(
      { _id: userId },
      { $set: { lastLoginAt: new Date() } }
    );
  }

  // ── update ────────────────────────────────────────────────────────────────
  async update(userId: string, data: Partial<IUser>): Promise<IUser | null> {
    const doc = await UserModel
      .findByIdAndUpdate(userId, { $set: data }, { new: true })
      .lean();
    if (!doc) return null;
    return this.toEntity(doc);
  }
}
