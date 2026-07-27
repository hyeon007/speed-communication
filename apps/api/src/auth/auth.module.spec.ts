import { assertProductionAuthConfiguration } from './auth.module';

describe('assertProductionAuthConfiguration', () => {
  const secureProductionEnvironment: NodeJS.ProcessEnv = {
    NODE_ENV: 'production',
    JWT_SECRET: 'a-long-and-unique-production-secret',
    ADMIN_PASSWORD: 'admin-password-that-is-not-a-placeholder',
    ADMIN_EDITOR_PASSWORD: 'editor-password-that-is-not-a-placeholder',
    ADMIN_OPERATOR_PASSWORD: 'operator-password-that-is-not-a-placeholder',
    ADMIN_VIEWER_PASSWORD: 'viewer-password-that-is-not-a-placeholder',
  };

  it('accepts explicitly configured production credentials', () => {
    expect(() =>
      assertProductionAuthConfiguration(secureProductionEnvironment),
    ).not.toThrow();
  });

  it('rejects default administrator credentials in production', () => {
    expect(() =>
      assertProductionAuthConfiguration({
        ...secureProductionEnvironment,
        ADMIN_OPERATOR_PASSWORD: 'change-me-operator',
      }),
    ).toThrow('ADMIN_OPERATOR_PASSWORD');
  });

  it('rejects the default JWT secret in production', () => {
    expect(() =>
      assertProductionAuthConfiguration({
        ...secureProductionEnvironment,
        JWT_SECRET: 'replace-this-secret-in-production',
      }),
    ).toThrow('JWT_SECRET');
  });
});
