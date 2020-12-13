import express from 'express';

export const app = express();

// new URL('../assets/image.svg', import.meta.url')

app.use((req, res) => {
  const suffix = process.env.NODE_ENV === 'production' ? `` : `?bustcache=${Math.random()}`;
  import(`./middleware/hypergateway.js${suffix}`).then(mod => mod.default(req, res));
});
