import { z } from 'zod';

// Schema para crear usuario
export const CreateUserSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  connection: z.string().min(1, 'Connection es obligatorio'),
  phone_number: z.string().optional(),
  user_metadata: z.record(z.string(), z.any()).optional(),
  blocked: z.boolean().optional(),
  email_verified: z.boolean().optional(),
  phone_verified: z.boolean().optional(),
  app_metadata: z.record(z.string(), z.any()).optional(),
  given_name: z.string().optional(),
  family_name: z.string().optional(),
  name: z.string().optional(),
  nickname: z.string().optional(),
  picture: z.string().url().optional(),
  user_id: z.string().optional(),
  verify_email: z.boolean().optional(),
  username: z.string().optional(),
});

// Schema para actualizar usuario
export const UpdateUserSchema = z.object({
  blocked: z.boolean().optional(),
  email_verified: z.boolean().optional(),
  email: z.string().email().optional(),
  phone_number: z.string().optional(),
  phone_verified: z.boolean().optional(),
  user_metadata: z.record(z.string(), z.any()).optional(),
  app_metadata: z.record(z.string(), z.any()).optional(),
  given_name: z.string().optional(),
  family_name: z.string().optional(),
  name: z.string().optional(),
  nickname: z.string().optional(),
  picture: z.string().url().optional(),
  verify_email: z.boolean().optional(),
  verify_phone_number: z.boolean().optional(),
  password: z.string().min(8).optional(),
  connection: z.string().optional(),
  client_id: z.string().optional(),
  username: z.string().optional(),
});

// Schema para el parámetro de ID de usuario
export const UserIdParamSchema = z.object({
  id: z.string().min(1, 'ID de usuario requerido'),
});

// Schema para query params de usuarios
export const UsersQuerySchema = z.object({
  page: z.string().optional().default('0'),
  per_page: z.string().optional().default('50'),
  search: z.string().optional(),
});

// Schema de respuesta de usuario
export const UserResponseSchema = z.object({
  success: z.boolean(),
  data: z.any(),
});

export type CreateUser = z.infer<typeof CreateUserSchema>;
export type UpdateUser = z.infer<typeof UpdateUserSchema>;
export type UsersQuery = z.infer<typeof UsersQuerySchema>;
