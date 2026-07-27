export function shouldEnableSwagger(
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  if (env.ENABLE_SWAGGER === 'true') {
    return true;
  }

  if (env.ENABLE_SWAGGER === 'false') {
    return false;
  }

  return env.NODE_ENV !== 'production';
}
