// Simple memory-based rate limiter for sensitive routes like auth
const requests = new Map();

const rateLimiter = (options = { windowMs: 15 * 60 * 1000, max: 100 }) => {
  return (req, res, next) => {
    const ip = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';
    const now = Date.now();

    if (!requests.has(ip)) {
      requests.set(ip, []);
    }

    const timestamps = requests.get(ip).filter((ts) => now - ts < options.windowMs);
    timestamps.push(now);
    requests.set(ip, timestamps);

    if (timestamps.length > options.max) {
      return res.status(429).json({
        success: false,
        error: 'Too many requests from this IP, please try again after 15 minutes.',
      });
    }

    next();
  };
};

module.exports = rateLimiter;
