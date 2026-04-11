import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  const originalJwtExpiresInSeconds = process.env.JWT_EXPIRES_IN_SECONDS;

  afterEach(() => {
    if (originalJwtExpiresInSeconds === undefined) {
      delete process.env.JWT_EXPIRES_IN_SECONDS;
    } else {
      process.env.JWT_EXPIRES_IN_SECONDS = originalJwtExpiresInSeconds;
    }
    jest.clearAllMocks();
  });

  it('signs admin tokens with the configured expiration and returns the same ttl', () => {
    process.env.JWT_EXPIRES_IN_SECONDS = '1234';

    const jwtService = {
      sign: jest.fn().mockReturnValue('signed-token'),
    } as unknown as JwtService;

    const service = new AuthService(jwtService);
    const result = service.login({
      username: 'admin',
      password: 'change-me-please',
    });

    expect((jwtService.sign as jest.Mock).mock.calls).toEqual([
      [
        {
          sub: 'admin:editor:admin',
          role: 'editor',
          username: 'admin',
        },
        {
          expiresIn: 1234,
        },
      ],
    ]);
    expect(result.expiresInSeconds).toBe(1234);
    expect(result.accessToken).toBe('signed-token');
  });
});
