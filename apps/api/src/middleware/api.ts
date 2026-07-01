import { createMiddleware } from 'hono/factory';
import { HTTPException } from 'hono/http-exception';

export const apiKeyMiddleware = createMiddleware(async (c, next) => {
  const apiKey = c.req.header('x-api-key');

  if (!apiKey || apiKey !== process.env.API_KEY) {
    throw new HTTPException(401, {
      message: 'Invalid API key',
    });
  }

  await next();
});
