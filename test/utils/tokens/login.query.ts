export const query =
  'query ($input: LoginInput) { \
          login(loginCredentials: $input) { \
              accessToken \
          }\
      }';
