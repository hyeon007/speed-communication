import { ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import type { Request } from 'express';
import {
  AdminBulkWriteRateLimitGuard,
  AdminLoginRateLimitGuard,
  AdminWriteRateLimitGuard,
  PublicLeadRateLimitGuard,
} from './rate-limit.guard';

type RequestOverrides = {
  ip?: string;
  xForwardedFor?: string;
  adminSub?: string;
};

function createExecutionContext(
  overrides?: RequestOverrides,
): ExecutionContext {
  const request: Partial<Request> & { admin?: { sub: string } } = {
    ip: overrides?.ip ?? '127.0.0.1',
    headers: {},
  };

  if (overrides?.xForwardedFor) {
    request.headers = {
      ...request.headers,
      'x-forwarded-for': overrides.xForwardedFor,
    };
  }

  if (overrides?.adminSub) {
    request.admin = {
      sub: overrides.adminSub,
    };
  }

  return {
    switchToHttp: () => ({
      getRequest: () => request,
    }),
  } as ExecutionContext;
}

function expectRateLimitError(executable: () => boolean): void {
  try {
    executable();
    throw new Error('Expected rate limit error');
  } catch (error) {
    expect(error).toBeInstanceOf(HttpException);
    if (!(error instanceof HttpException)) {
      return;
    }
    expect(error.getStatus()).toBe(HttpStatus.TOO_MANY_REQUESTS);
  }
}

describe('RateLimit guards', () => {
  afterEach(() => {
    delete process.env.RATE_LIMIT_TRUST_PROXY_HEADER;
  });

  it('limits public lead submissions by requester IP', () => {
    const guard = new PublicLeadRateLimitGuard();

    for (let index = 0; index < 10; index += 1) {
      expect(guard.canActivate(createExecutionContext())).toBe(true);
    }

    expectRateLimitError(() => guard.canActivate(createExecutionContext()));
  });

  it('separates public rate limits by forwarded IP', () => {
    process.env.RATE_LIMIT_TRUST_PROXY_HEADER = 'true';
    const guard = new PublicLeadRateLimitGuard();

    for (let index = 0; index < 10; index += 1) {
      expect(
        guard.canActivate(
          createExecutionContext({ xForwardedFor: '203.0.113.10' }),
        ),
      ).toBe(true);
    }

    expectRateLimitError(() =>
      guard.canActivate(
        createExecutionContext({ xForwardedFor: '203.0.113.10' }),
      ),
    );

    expect(
      guard.canActivate(
        createExecutionContext({ xForwardedFor: '203.0.113.11' }),
      ),
    ).toBe(true);
  });

  it('limits admin single-write operations per admin subject', () => {
    const guard = new AdminWriteRateLimitGuard();

    for (let index = 0; index < 30; index += 1) {
      expect(
        guard.canActivate(
          createExecutionContext({ adminSub: 'admin:operator' }),
        ),
      ).toBe(true);
    }

    expectRateLimitError(() =>
      guard.canActivate(createExecutionContext({ adminSub: 'admin:operator' })),
    );

    expect(
      guard.canActivate(createExecutionContext({ adminSub: 'admin:editor' })),
    ).toBe(true);
  });

  it('limits admin bulk writes with stricter threshold', () => {
    const guard = new AdminBulkWriteRateLimitGuard();

    for (let index = 0; index < 10; index += 1) {
      expect(
        guard.canActivate(createExecutionContext({ adminSub: 'admin:editor' })),
      ).toBe(true);
    }

    expectRateLimitError(() =>
      guard.canActivate(createExecutionContext({ adminSub: 'admin:editor' })),
    );
  });

  it('limits admin login attempts per requester IP', () => {
    const guard = new AdminLoginRateLimitGuard();

    for (let index = 0; index < 5; index += 1) {
      expect(guard.canActivate(createExecutionContext())).toBe(true);
    }

    expectRateLimitError(() => guard.canActivate(createExecutionContext()));
  });
});
