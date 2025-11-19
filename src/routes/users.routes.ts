import { Hono } from 'hono';
import { getUsers } from '../controllers/users/get_users';
import { postCreateUser } from '../controllers/users/post_create_user';
import { patchUpdateUser } from '../controllers/users/patch_update_user';

const usersRouter = new Hono();

// GET /users - Obtener todos los usuarios
usersRouter.get('/', getUsers);

// POST /users - Crear un nuevo usuario
usersRouter.post('/', postCreateUser);

// PATCH /users/:id - Actualizar un usuario
usersRouter.patch('/:id', patchUpdateUser);

export default usersRouter;
