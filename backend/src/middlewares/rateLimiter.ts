import rateLimit, { MemoryStore } from 'express-rate-limit';

export const rateLimitStore = new MemoryStore();
export const authLimitStore = new MemoryStore();

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 250, // limit each IP to 250 requests per windowMs

  message: {
    success: false,
    message:
      'Too many requests from this IP, please try again after 15 minutes.',
  },

  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers

  store: rateLimitStore,
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 25, // limit each IP to 25 requests per windowMs

  message: {
    success: false,
    message:
      'Too many auth requests from this IP, please try again after 15 minutes.',
  },

  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers

  store: authLimitStore,
});
