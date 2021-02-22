export const confirmedUserToken = async (request, app) => {
  const query =
    'query ($input: LoginInput) { \
        login(loginCredentials: $input) { \
            accessToken \
        }\
    }';

  const response = await request(app.getHttpServer())
    .post('/graphql')
    .send({
      query: query,
      variables: {
        input: {
          email: 'gary.green@gmail.com',
          password: 'garyPassword1',
        },
      },
    });

  return await response.body.data.login.accessToken;
};
