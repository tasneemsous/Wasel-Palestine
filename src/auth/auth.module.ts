import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

import { User } from '../users/user.entity';
import { RefreshToken } from './refresh-token.entity';

import { JwtStrategy } from './jwt.strategy';
import { RolesGuard } from './roles.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, RefreshToken]),

    JwtModule.register({
      secret: process.env.JWT_SECRET || 'super_secret_key',
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [AuthController],

  providers: [AuthService, JwtStrategy, RolesGuard],
  exports: [JwtModule, RolesGuard],
})
export class AuthModule {}