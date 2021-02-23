import { query } from './login.query';

export const customUserToken = async (request, app, email, password) => {
  const response = await request(app.getHttpServer())
    .post('/graphql')
    .send({
      query: query,
      variables: {
        input: {
          email: email,
          password: password,
        },
      },
    });

  return await response.body.data.login.accessToken;
};
