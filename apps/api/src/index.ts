import app from './app.js';
import { env } from './config/env.js';

const PORT = env.PORT || 5000;

// Vercel serverless mühitində listen() tələb olunmur, amma lokal üçün lazımdır
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 Server http://localhost:${PORT} ünvanında işləyir [${env.NODE_ENV}]`);
  });
}

// Vercel üçün export etmək şərtdir
export default app;
