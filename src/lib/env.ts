const nodeEnv = process.env.NODE_ENV ?? 'production';

export const env = {
  posthog: {
    key: process.env.BUN_PUBLIC_POSTHOG_KEY ?? '',
    host: process.env.BUN_PUBLIC_POSTHOG_HOST ?? '',
  },
  nodeEnv,
  isProduction: nodeEnv === 'production',
  isDevelopment: nodeEnv === 'development',
} as const;
