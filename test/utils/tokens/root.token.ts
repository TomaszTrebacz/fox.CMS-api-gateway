import { query } from './login.query';

export const rootToken = async (request, app) => {
  const response = await request(app.getHttpServer())
    .post('/graphql')
    .send({
      query: query,
      variables: {
        input: {
          email: 'john.smith@outlook.com',
          password: 'JohnSmith',
        },
      },
    });

  return await response.body.data.login.accessToken;
};
