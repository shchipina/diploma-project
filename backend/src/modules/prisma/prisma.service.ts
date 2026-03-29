import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    const connectionString = process.env.DATABASE_URL;
    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);
    super({
      adapter,
      log: ['error', 'warn'],
    });
    console.log('🔨 PrismaService constructor called');
  }

  async onModuleInit() {
    console.log('🔌 Connecting to Prisma...');
    try {
      await this.$connect();
      console.log('✅ Prisma connected successfully');
    } catch (error) {
      console.error('❌ Prisma connection failed:', error);
      throw error;
    }

    await this.ensureAdminExists();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  private async ensureAdminExists() {
    const adminEmail = 'admin@admin.com';
    const existing = await this.user.findUnique({
      where: { email: adminEmail },
    });

    if (!existing) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await this.user.create({
        data: {
          email: adminEmail,
          password: hashedPassword,
          role: 'ADMIN',
        },
      });
      console.log('👑 Admin user created (admin@admin.com / admin123)');
    } else {
      const isCorrectPassword = await bcrypt.compare(
        'admin123',
        existing.password,
      );
      const needsUpdate = existing.role !== 'ADMIN' || !isCorrectPassword;

      if (needsUpdate) {
        const hashedPassword = await bcrypt.hash('admin123', 10);
        await this.user.update({
          where: { email: adminEmail },
          data: { role: 'ADMIN', password: hashedPassword },
        });
        console.log(
          '👑 Admin credentials updated (admin@admin.com / admin123)',
        );
      } else {
        console.log('👑 Admin user already exists');
      }
    }
  }
}
