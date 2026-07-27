import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AdminAuthGuard } from './admin-auth.guard';
import { AdminBulkWriteGuard } from './admin-bulk-write.guard';
import { AdminWriteGuard } from './admin-write.guard';
import {
  AdminBulkWriteRateLimitGuard,
  AdminLoginRateLimitGuard,
  AdminWriteRateLimitGuard,
  PublicLeadRateLimitGuard,
} from './rate-limit.guard';

const DEFAULT_JWT_SECRET = 'replace-this-secret-in-production';
const DEFAULT_ADMIN_PASSWORDS = new Set([
  'change-me-please',
  'change-me-operator',
  'change-me-viewer',
]);

function isUnsetOrDefaultPassword(value: string | undefined): boolean {
  return (
    value === undefined ||
    value.trim().length === 0 ||
    DEFAULT_ADMIN_PASSWORDS.has(value)
  );
}

export function assertProductionAuthConfiguration(
  env: NodeJS.ProcessEnv = process.env,
): void {
  if (env.NODE_ENV !== 'production') {
    return;
  }

  if (env.JWT_SECRET === undefined || env.JWT_SECRET === DEFAULT_JWT_SECRET) {
    throw new Error(
      'Production mode requires a non-default JWT_SECRET environment variable.',
    );
  }

  const passwordSettings = [
    ['ADMIN_PASSWORD', env.ADMIN_PASSWORD],
    ['ADMIN_EDITOR_PASSWORD', env.ADMIN_EDITOR_PASSWORD ?? env.ADMIN_PASSWORD],
    ['ADMIN_OPERATOR_PASSWORD', env.ADMIN_OPERATOR_PASSWORD],
    ['ADMIN_VIEWER_PASSWORD', env.ADMIN_VIEWER_PASSWORD],
  ] as const;

  const insecureSettings = passwordSettings
    .filter(([, value]) => isUnsetOrDefaultPassword(value))
    .map(([name]) => name);

  if (insecureSettings.length > 0) {
    throw new Error(
      `Production mode requires non-default administrator passwords: ${insecureSettings.join(', ')}.`,
    );
  }
}

assertProductionAuthConfiguration();

const jwtExpiresInSeconds = Number(process.env.JWT_EXPIRES_IN_SECONDS ?? 43200);
const jwtSecret = process.env.JWT_SECRET ?? DEFAULT_JWT_SECRET;

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
    AdminLoginRateLimitGuard,
    AdminWriteRateLimitGuard,
    AdminBulkWriteRateLimitGuard,
  ],
  exports: [
    AuthService,
    AdminAuthGuard,
    AdminWriteGuard,
    AdminBulkWriteGuard,
    PublicLeadRateLimitGuard,
    AdminLoginRateLimitGuard,
    AdminWriteRateLimitGuard,
    AdminBulkWriteRateLimitGuard,
  ],
})
export class AuthModule {}
