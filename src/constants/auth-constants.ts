export const SALT_ROUNDS = 10;

export const ACCESS_TOKEN_EXP = Math.floor(Date.now() / 1000) + 60 * 15;
export const REFRESH_TOKEN_EXP = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7;

