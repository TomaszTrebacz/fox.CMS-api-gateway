import { query } from './login.query';

export const adminToken = async (request, app) => {
  const response = await request(app.getHttpServer())
    .post('/graphql')
    .send({
      query: query,
      variables: {
        input: {
          email: 'stephen.edwards@yahoo.com',
          password: 'stephenPassword1',
        },
      },
    });

  return await response.body.data.login.accessToken;
};
