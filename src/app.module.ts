import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ReportsModule } from './Reports/reports.module'; // 🔥 إضافة ReportsModule

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: 5432,
      username: process.env.DB_USER || 'tasneem_admin',
      password: process.env.DB_PASSWORD || 'tasneem1234',
      database: process.env.DB_NAME || 'wasel_database',

      autoLoadEntities: true, // 🔥 يلتقط كل الـ entities تلقائياً

      synchronize: false,
    }),

    AuthModule,
    UsersModule,
    ReportsModule, // 🔥 تم إضافة ReportsModule
  ],
})
export class AppModule {}