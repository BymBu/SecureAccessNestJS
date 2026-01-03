export const OAuthGrantType = {
  PASSWORD: 'password',
  REFRESH_TOKEN: 'refresh_token',
  AUTHORIZATION_CODE: 'authorization_code',
} as const;

export const OAuthResponseType = {
  CODE: 'code',
} as const;

export const OAuthCodeChallengeMethod = {
  S256: 'S256',
  PLAIN: 'plain',
} as const;

export const OAuthScope = {
  OPENID: 'openid',
  PROFILE: 'profile',
  EMAIL: 'email',
  PHONE: 'phone',
};
