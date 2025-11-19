import { z } from 'zod';

// Schema para crear rol
export const CreateRoleSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio'),
  description: z.string().min(1, 'La descripción es obligatoria'),
});

// Schema para actualizar rol
export const UpdateRoleSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
});

// Schema para asignar usuarios a rol
export const AssignUsersToRoleSchema = z.object({
  users: z.array(z.string()).min(1, 'Debe proporcionar al menos un usuario'),
});

// Schema para el parámetro de ID de rol
export const RoleIdParamSchema = z.object({
  id: z.string().min(1, 'ID de rol requerido'),
});

// Schema para query params de roles
export const RolesQuerySchema = z.object({
  page: z.string().optional().default('0'),
  per_page: z.string().optional().default('50'),
});

// Schema de respuesta de rol
export const RoleResponseSchema = z.object({
  success: z.boolean(),
  data: z.any(),
});

export type CreateRole = z.infer<typeof CreateRoleSchema>;
export type UpdateRole = z.infer<typeof UpdateRoleSchema>;
export type AssignUsersToRole = z.infer<typeof AssignUsersToRoleSchema>;
export type RolesQuery = z.infer<typeof RolesQuerySchema>;
