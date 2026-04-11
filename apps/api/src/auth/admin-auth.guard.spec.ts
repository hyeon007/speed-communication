import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';
import { AdminAuthGuard } from './admin-auth.guard';
import type { AdminJwtPayload, AuthService } from './auth.service';

type RequestOverrides = {
  authorization?: string;
  cookie?: string;
};

function createExecutionContext(
  overrides?: RequestOverrides,
): ExecutionContext {
  const request: Partial<Request> = {
    headers: {},
  };

  if (overrides?.authorization) {
    request.headers = {
      ...request.headers,
      authorization: overrides.authorization,
    };
  }

  if (overrides?.cookie) {
    request.headers = {
      ...request.headers,
      cookie: overrides.cookie,
    };
  }

  return {
    switchToHttp: () => ({
      getRequest: () => request,
    }),
  } as ExecutionContext;
}

describe('AdminAuthGuard', () => {
  const payload: AdminJwtPayload = {
    sub: 'admin:editor:admin',
    role: 'editor',
    username: 'admin',
    iat: 1,
    exp: 2,
  };

  function createGuard(verifyToken = jest.fn().mockReturnValue(payload)) {
    const authService = {
      verifyToken,
    } as unknown as AuthService;

    return {
      guard: new AdminAuthGuard(authService),
      verifyToken,
    };
  }

  it('accepts bearer tokens from the authorization header', () => {
    const { guard, verifyToken } = createGuard();

    expect(
      guard.canActivate(
        createExecutionContext({ authorization: 'Bearer header-token' }),
      ),
    ).toBe(true);
    expect(verifyToken).toHaveBeenCalledWith('header-token');
  });

  it('falls back to the admin auth cookie', () => {
    const { guard, verifyToken } = createGuard();

    expect(
      guard.canActivate(
        createExecutionContext({
          cookie: 'theme=dark; sp_admin_access_token=cookie-token',
        }),
      ),
    ).toBe(true);
    expect(verifyToken).toHaveBeenCalledWith('cookie-token');
  });

  it('rejects requests without a bearer token or auth cookie', () => {
    const { guard } = createGuard();

    expect(() => guard.canActivate(createExecutionContext())).toThrow(
      UnauthorizedException,
    );
  });
});
