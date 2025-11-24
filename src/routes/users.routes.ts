import { Hono } from 'hono';
import { getUsers } from '../controllers/users/get_users';
import { postCreateUser } from '../controllers/users/post_create_user';
import { patchUpdateUser } from '../controllers/users/patch_update_user';
import { getUserRoles } from '../controllers/users/get_user_roles';
import { postAssignRolesToUser } from '../controllers/users/post_assign_roles_to_user';
import { deleteRemoveRolesFromUser } from '../controllers/users/delete_remove_roles_from_user';

const usersRouter = new Hono();

// GET /users - Obtener todos los usuarios
usersRouter.get('/', getUsers);

// POST /users - Crear un nuevo usuario
usersRouter.post('/', postCreateUser);

// PATCH /users/:id - Actualizar un usuario
usersRouter.patch('/:id', patchUpdateUser);

// GET /users/:id/roles - Obtener roles de un usuario
usersRouter.get('/:id/roles', getUserRoles);

// POST /users/:id/roles - Asignar roles a un usuario
usersRouter.post('/:id/roles', postAssignRolesToUser);

// DELETE /users/:id/roles - Remover roles de un usuario
usersRouter.delete('/:id/roles', deleteRemoveRolesFromUser);

export default usersRouter;
