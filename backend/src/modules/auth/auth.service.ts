import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  Inject,
  LoggerService,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '@modules/prisma/prisma.service';
import { RedisService } from '@modules/redis/redis.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import {
  JwtPayload,
  JwtRefreshPayload,
  TokenPair,
  LoginResponse,
} from '@common/interfaces/jwt-payload.interface';
import { Role } from '@common/enums/role.enum';
import { User } from '@prisma/client';
import {
  ConflictException as AppConflictException,
  AuthenticationException,
} from '@common/exceptions';

@Injectable()
export class AuthService {
  private readonly SALT_ROUNDS = 10;

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private redisService: RedisService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
  ) {}

  async register(dto: RegisterDto): Promise<LoginResponse> {
    this.logger.log(
      `Registration attempt for email: ${dto.email}`,
      'AuthService',
    );

    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
      select: { id: true, email: true },
    });

    if (existingUser) {
      this.logger.warn(
        `Registration failed: User ${dto.email} already exists`,
        'AuthService',
      );
      throw new AppConflictException('User with this email already exists', {
        email: dto.email,
      });
    }

    const hashedPassword = await bcrypt.hash(dto.password, this.SALT_ROUNDS);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        role: Role.USER,
      },
    });

    this.logger.log(
      `User registered successfully: ${user.email} (ID: ${user.id})`,
      'AuthService',
    );

    await this.redisService.cacheUserByEmail(user.email, user, 300);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = user;

    const tokens = await this.generateTokenPair(user);
    await this.saveRefreshTokenToRedis(user.id, tokens.refreshToken);

    return {
      user: userWithoutPassword,
      ...tokens,
    };
  }

  async login(dto: LoginDto): Promise<LoginResponse> {
    this.logger.log(`Login attempt for email: ${dto.email}`, 'AuthService');

    const cacheKey = dto.email;
    let user = await this.redisService.getCachedUserByEmail(cacheKey);

    if (user) {
      this.logger.debug(
        `Cache HIT: User ${dto.email} retrieved from cache`,
        'AuthService',
      );
    } else {
      this.logger.debug(
        `Cache MISS: Fetching user ${dto.email} from database`,
        'AuthService',
      );

      user = (await this.prisma.user.findUnique({
        where: { email: dto.email },
        select: {
          id: true,
          email: true,
          password: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      })) as User | null;

      if (user) {
        await this.redisService.cacheUserByEmail(dto.email, user, 300);
        this.logger.debug(
          `User ${dto.email} cached for 5 minutes`,
          'AuthService',
        );
      }
    }

    if (!user) {
      this.logger.warn(
        `Login failed: User ${dto.email} not found`,
        'AuthService',
      );
      throw new AuthenticationException('Invalid credentials', {
        email: dto.email,
      });
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);

    if (!isPasswordValid) {
      this.logger.warn(
        `Login failed: Invalid password for ${dto.email}`,
        'AuthService',
      );
      throw new AuthenticationException('Invalid credentials', {
        email: dto.email,
      });
    }

    const tokens = await this.generateTokenPair(user);

    await this.saveRefreshTokenToRedis(user.id, tokens.refreshToken);

    this.logger.log(
      `User logged in successfully: ${user.email} (ID: ${user.id})`,
      'AuthService',
    );

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      ...tokens,
    };
  }

  async refresh(refreshToken: string, userId: string): Promise<TokenPair> {
    this.logger?.debug?.(
      `Token refresh attempt for user: ${userId}`,
      'AuthService',
    );

    if (!refreshToken) {
      throw new BadRequestException('Refresh token is required');
    }

    try {
      const payload = this.jwtService.verify<JwtRefreshPayload>(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      if (payload.sub !== userId) {
        this.logger.warn(
          `Token refresh failed: User ID mismatch for ${userId}`,
          'AuthService',
        );
        throw new AuthenticationException('Invalid token', { userId });
      }

      const isValid = await this.redisService.validateRefreshToken(
        userId,
        refreshToken,
      );

      if (!isValid) {
        this.logger.warn(
          `Token refresh failed: Invalid refresh token for ${userId}`,
          'AuthService',
        );
        throw new AuthenticationException('Invalid or expired refresh token', {
          userId,
        });
      }

      const user = (await this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          password: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      })) as User | null;

      if (!user) {
        this.logger.warn(
          `Token refresh failed: User ${userId} not found`,
          'AuthService',
        );
        throw new AuthenticationException('User not found', { userId });
      }

      const tokens = await this.generateTokenPair(user);

      await this.saveRefreshTokenToRedis(user.id, tokens.refreshToken);

      this.logger.log(
        `Token refreshed successfully for user: ${userId}`,
        'AuthService',
      );

      return tokens;
    } catch (error) {
      if (error instanceof AuthenticationException) {
        throw error;
      }
      this.logger.error(
        `Token refresh error for user ${userId}`,
        JSON.stringify({
          error: error instanceof Error ? error.message : String(error),
        }),
        'AuthService',
      );
      throw new AuthenticationException('Invalid or expired refresh token', {
        userId,
      });
    }
  }

  async logout(userId: string): Promise<{ message: string }> {
    this.logger.log(`User logged out: ${userId}`, 'AuthService');
    await this.redisService.deleteRefreshToken(userId);
    return { message: 'Logged out successfully' };
  }

  async validateUser(payload: JwtPayload): Promise<Omit<User, 'password'>> {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  private async generateTokenPair(user: User): Promise<TokenPair> {
    const accessPayload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role as Role,
    };

    const refreshPayload: JwtRefreshPayload = {
      sub: user.id,
      email: user.email,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(accessPayload, {
        secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
        expiresIn: this.configService.get('JWT_ACCESS_EXPIRES_IN', '15m'),
      }),
      this.jwtService.signAsync(refreshPayload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN', '7d'),
      }),
    ]);

    return { accessToken, refreshToken };
  }

  private async saveRefreshTokenToRedis(
    userId: string,
    refreshToken: string,
  ): Promise<void> {
    const expiresIn = this.configService.get<string>(
      'JWT_REFRESH_EXPIRES_IN',
      '7d',
    );
    const ttlSeconds = this.parseDurationToSeconds(expiresIn);

    await this.redisService.saveRefreshToken(userId, refreshToken, ttlSeconds);
  }

  private parseDurationToSeconds(duration: string): number {
    const unit = duration.slice(-1);
    const value = parseInt(duration.slice(0, -1), 10);

    switch (unit) {
      case 's':
        return value;
      case 'm':
        return value * 60;
      case 'h':
        return value * 60 * 60;
      case 'd':
        return value * 24 * 60 * 60;
      default:
        return 7 * 24 * 60 * 60;
    }
  }
}
