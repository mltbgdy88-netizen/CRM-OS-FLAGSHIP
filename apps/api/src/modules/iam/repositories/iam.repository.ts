import { Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import type { TenantContext } from '@crm-os/database';
import { withTenantContext } from '@crm-os/database';
import { PrismaService } from '../../../database/prisma.service';

@Injectable()
export class IamRepository {
  constructor(private readonly prisma: PrismaService) {}

  findUserById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  findUserByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  findTenantBySlug(slug: string) {
    return this.prisma.tenant.findUnique({ where: { slug } });
  }

  async findMembershipInTenant(context: TenantContext) {
    return withTenantContext(this.prisma, context, async (tx) =>
      tx.tenantMember.findFirst({
        where: {
          tenantId: context.tenantId,
          userId: context.userId,
          deletedAt: null,
        },
      }),
    );
  }

  async listUsers(context: TenantContext) {
    return withTenantContext(this.prisma, context, async (tx) =>
      tx.tenantMember.findMany({
        where: { tenantId: context.tenantId, deletedAt: null },
        include: { user: true },
      }),
    );
  }

  async createRole(
    context: TenantContext,
    input: { code: string; name: string; isSystem?: boolean },
  ) {
    return withTenantContext(this.prisma, context, async (tx) =>
      tx.role.create({
        data: {
          tenantId: context.tenantId,
          code: input.code,
          name: input.name,
          isSystem: input.isSystem ?? false,
          createdBy: context.userId,
        },
      }),
    );
  }

  async listUserPermissionCodes(context: TenantContext): Promise<string[]> {
    return withTenantContext(this.prisma, context, async (tx) => {
      const membership = await tx.tenantMember.findFirst({
        where: { tenantId: context.tenantId, userId: context.userId, deletedAt: null },
      });
      if (!membership) {
        return [];
      }

      const memberRoles = await tx.memberRole.findMany({
        where: { tenantId: context.tenantId, tenantMemberId: membership.id },
        include: {
          role: {
            include: {
              rolePermissions: {
                include: { permission: true },
              },
            },
          },
        },
      });

      const codes = new Set<string>();
      for (const memberRole of memberRoles) {
        for (const rolePermission of memberRole.role.rolePermissions) {
          codes.add(rolePermission.permission.code);
        }
      }
      return [...codes];
    });
  }

  async writeAuditLog(
    context: TenantContext,
    input: {
      action: string;
      entityType: string;
      entityId?: string;
      payload?: Record<string, unknown>;
      ipAddress?: string;
      userAgent?: string;
    },
  ) {
    return withTenantContext(this.prisma, context, async (tx) =>
      tx.auditLog.create({
        data: {
          tenantId: context.tenantId,
          actorUserId: context.userId,
          action: input.action,
          entityType: input.entityType,
          entityId: input.entityId,
          payload: input.payload as Prisma.InputJsonValue | undefined,
          ipAddress: input.ipAddress,
          userAgent: input.userAgent,
          createdBy: context.userId,
        },
      }),
    );
  }

  async createSession(
    context: TenantContext,
    refreshTokenHash: string,
    expiresAt: Date,
  ) {
    return withTenantContext(this.prisma, context, async (tx) =>
      tx.session.create({
        data: {
          userId: context.userId,
          activeTenantId: context.tenantId,
          refreshTokenHash,
          expiresAt,
        },
      }),
    );
  }

  findSessionByRefreshHash(context: TenantContext, refreshTokenHash: string) {
    return withTenantContext(this.prisma, context, async (tx) =>
      tx.session.findFirst({
        where: {
          userId: context.userId,
          activeTenantId: context.tenantId,
          refreshTokenHash,
          revokedAt: null,
          expiresAt: { gt: new Date() },
        },
        include: { user: true },
      }),
    );
  }

  revokeSession(context: TenantContext, sessionId: string) {
    return withTenantContext(this.prisma, context, async (tx) =>
      tx.session.update({
        where: { id: sessionId },
        data: { revokedAt: new Date() },
      }),
    );
  }
}
