import express from 'express';

export const app = express();

// new URL('../assets/image.svg', import.meta.url')

app.use(async (req, res, next) => {
  const suffix = process.env.NODE_ENV === 'production' ? `` : `?bustcache=${Math.random()}`;
  (await import(`./middleware/beam.js${suffix}`)).default(req, res, next);
});

app.use(async (req, res, next) => {
  const suffix = process.env.NODE_ENV === 'production' ? `` : `?bustcache=${Math.random()}`;
  (await import(`./middleware/hypergateway.js${suffix}`)).default(req, res, next);
});