import { Hono } from 'hono';
import { getRoles } from '../controllers/roles/get_roles';
import { postCreateRole } from '../controllers/roles/post_create_role';
import { patchUpdateRole } from '../controllers/roles/patch_update_role';
import { postAssignUserToRole } from '../controllers/roles/post_assign_user_to_role';
import { getRoleUsers } from '../controllers/roles/get_role_users';

const rolesRouter = new Hono();

// GET /roles - Obtener todos los roles
rolesRouter.get('/', getRoles);

// POST /roles - Crear un nuevo rol
rolesRouter.post('/', postCreateRole);

// PATCH /roles/:id - Actualizar un rol
rolesRouter.patch('/:id', patchUpdateRole);

// POST /roles/:id/users - Asignar usuarios a un rol
rolesRouter.post('/:id/users', postAssignUserToRole);

// GET /roles/:id/users - Obtener usuarios de un rol
rolesRouter.get('/:id/users', getRoleUsers);

export default rolesRouter;
