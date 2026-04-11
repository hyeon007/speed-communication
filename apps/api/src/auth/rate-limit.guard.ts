import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import type { Request } from 'express';
import type { AdminRequest } from './admin-auth.guard';

type RateLimitRule = {
  maxRequests: number;
  windowMs: number;
  scope: string;
};

type Bucket = {
  count: number;
  resetAt: number;
};

abstract class BaseRateLimitGuard implements CanActivate {
  private readonly buckets = new Map<string, Bucket>();

  constructor(private readonly rule: RateLimitRule) {}

  protected abstract getIdentifier(request: Request): string;

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const now = Date.now();
    const identifier = this.getIdentifier(request);
    const key = `${this.rule.scope}:${identifier}`;
    const existing = this.buckets.get(key);

    if (!existing || existing.resetAt <= now) {
      this.buckets.set(key, {
        count: 1,
        resetAt: now + this.rule.windowMs,
      });
      this.cleanupExpiredBuckets(now);
      return true;
    }

    if (existing.count >= this.rule.maxRequests) {
      const retryAfterSeconds = Math.max(
        1,
        Math.ceil((existing.resetAt - now) / 1000),
      );

      throw new HttpException(
        `요청이 너무 많습니다. ${retryAfterSeconds}초 후 다시 시도해주세요.`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    existing.count += 1;
    this.cleanupExpiredBuckets(now);
    return true;
  }

  private cleanupExpiredBuckets(now: number): void {
    for (const [key, bucket] of this.buckets.entries()) {
      if (bucket.resetAt <= now) {
        this.buckets.delete(key);
      }
    }
  }

  protected getRequestIp(request: Request): string {
    const trustProxyHeader =
      process.env.RATE_LIMIT_TRUST_PROXY_HEADER === 'true';

    if (!trustProxyHeader) {
      return request.ip ?? 'unknown';
    }

    const forwardedFor = request.headers['x-forwarded-for'];

    if (typeof forwardedFor === 'string' && forwardedFor.trim().length > 0) {
      const [clientIp] = forwardedFor.split(',');
      if (clientIp) {
        return clientIp.trim();
      }
    }

    if (Array.isArray(forwardedFor) && forwardedFor.length > 0) {
      const [clientIp] = forwardedFor;
      if (clientIp && clientIp.trim().length > 0) {
        return clientIp.trim();
      }
    }

    return request.ip ?? 'unknown';
  }
}

@Injectable()
export class PublicLeadRateLimitGuard extends BaseRateLimitGuard {
  constructor() {
    super({
      scope: 'public-lead-write',
      maxRequests: 10,
      windowMs: 60_000,
    });
  }

  protected getIdentifier(request: Request): string {
    return this.getRequestIp(request);
  }
}

@Injectable()
export class AdminLoginRateLimitGuard extends BaseRateLimitGuard {
  constructor() {
    super({
      scope: 'admin-login',
      maxRequests: 5,
      windowMs: 60_000,
    });
  }

  protected getIdentifier(request: Request): string {
    return this.getRequestIp(request);
  }
}

@Injectable()
export class AdminWriteRateLimitGuard extends BaseRateLimitGuard {
  constructor() {
    super({
      scope: 'admin-write',
      maxRequests: 30,
      windowMs: 60_000,
    });
  }

  protected getIdentifier(request: Request): string {
    const adminRequest = request as AdminRequest;
    if (adminRequest.admin?.sub) {
      return adminRequest.admin.sub;
    }

    return this.getRequestIp(request);
  }
}

@Injectable()
export class AdminBulkWriteRateLimitGuard extends BaseRateLimitGuard {
  constructor() {
    super({
      scope: 'admin-bulk-write',
      maxRequests: 10,
      windowMs: 60_000,
    });
  }

  protected getIdentifier(request: Request): string {
    const adminRequest = request as AdminRequest;
    if (adminRequest.admin?.sub) {
      return adminRequest.admin.sub;
    }

    return this.getRequestIp(request);
  }
}
