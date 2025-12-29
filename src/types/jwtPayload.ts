import z, { TypeOf } from "zod";

export const JwtTokenPayload = z.object({
  sub: z.string().nullish(),
  userId: z.string(),
  iat: z.number().nullish(),
  exp: z.number().nullish(),
});

export type JwtTokenPayload = TypeOf<typeof JwtTokenPayload>;
