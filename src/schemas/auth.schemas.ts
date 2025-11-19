import { z } from 'zod';

// Schema para la respuesta del token
export const TokenResponseSchema = z.object({
  success: z.boolean(),
  access_token: z.string(),
  token_type: z.string(),
});

export type TokenResponse = z.infer<typeof TokenResponseSchema>;
