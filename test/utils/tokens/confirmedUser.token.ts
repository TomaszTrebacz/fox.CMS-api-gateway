import { query } from './login.query';

export const confirmedUserToken = async (request, app) => {
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
