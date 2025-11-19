import { Hono } from 'hono';
import { postGetToken } from '../controllers/auth/post_get_token';

const authRouter = new Hono();

// POST /auth/token - Obtener token de Auth0
authRouter.post('/token', postGetToken);

export default authRouter;
