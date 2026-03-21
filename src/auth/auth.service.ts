import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

//import { User } from './user.entity';
import { User } from '../users/user.entity';
import { RefreshToken } from './refresh-token.entity';
import { CreateUserDto } from './create-user.dto';
import { LoginDto } from './login.dto';

@Injectable()
export class AuthService {

  constructor(
    @InjectRepository(User)
    private usersRepo: Repository<User>,

    @InjectRepository(RefreshToken)
    private refreshRepo: Repository<RefreshToken>,

    private jwtService: JwtService,
  ) {}

  async register(dto: CreateUserDto) {

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = this.usersRepo.create({
      username: dto.username,
      email: dto.email,
      passwordHash: hashedPassword,
    });

    return this.usersRepo.save(user);
  }

  async login(dto: LoginDto) {

    const user = await this.usersRepo.findOne({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordValid = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );

    if (!passwordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload);

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '7d',
    });

    const refresh = this.refreshRepo.create({
      userId: user.id,
      token: refreshToken,
      expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    await this.refreshRepo.save(refresh);

    return {
      accessToken,
      refreshToken,
    };
  }

  async refreshToken(token: string) {

    const stored = await this.refreshRepo.findOne({
      where: { token },
    });

    if (!stored) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const payload = this.jwtService.verify(token);

    const accessToken = this.jwtService.sign({
      sub: payload.sub,
      email: payload.email,
      role: payload.role,
    });

    return { accessToken };
  }
}