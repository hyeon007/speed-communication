import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AdminAuthGuard } from './admin-auth.guard';
import { AdminBulkWriteGuard } from './admin-bulk-write.guard';
import { AdminWriteGuard } from './admin-write.guard';
import {
  AdminBulkWriteRateLimitGuard,
  AdminWriteRateLimitGuard,
  PublicLeadRateLimitGuard,
} from './rate-limit.guard';

const jwtExpiresInSeconds = Number(process.env.JWT_EXPIRES_IN_SECONDS ?? 43200);
const jwtSecret = process.env.JWT_SECRET ?? 'replace-this-secret-in-production';
const isProduction = process.env.NODE_ENV === 'production';

if (
  isProduction &&
  (jwtSecret === 'replace-this-secret-in-production' ||
    process.env.JWT_SECRET === undefined)
) {
  throw new Error(
    'Production mode requires a non-default JWT_SECRET environment variable.',
  );
}

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: jwtSecret,
      signOptions: {
        expiresIn: Number.isFinite(jwtExpiresInSeconds)
          ? jwtExpiresInSeconds
          : 43200,
      },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    AdminAuthGuard,
    AdminWriteGuard,
    AdminBulkWriteGuard,
    PublicLeadRateLimitGuard,
    AdminWriteRateLimitGuard,
    AdminBulkWriteRateLimitGuard,
  ],
  exports: [
    AuthService,
    AdminAuthGuard,
    AdminWriteGuard,
    AdminBulkWriteGuard,
    PublicLeadRateLimitGuard,
    AdminWriteRateLimitGuard,
    AdminBulkWriteRateLimitGuard,
  ],
})
export class AuthModule {}
