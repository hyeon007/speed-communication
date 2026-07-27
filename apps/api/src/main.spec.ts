import { shouldEnableSwagger } from './swagger';

describe('shouldEnableSwagger', () => {
  it('disables API documentation by default in production', () => {
    expect(shouldEnableSwagger({ NODE_ENV: 'production' })).toBe(false);
  });

  it('keeps API documentation enabled by default in development', () => {
    expect(shouldEnableSwagger({ NODE_ENV: 'development' })).toBe(true);
  });

  it('allows an explicit production opt-in', () => {
    expect(
      shouldEnableSwagger({ NODE_ENV: 'production', ENABLE_SWAGGER: 'true' }),
    ).toBe(true);
  });
});
