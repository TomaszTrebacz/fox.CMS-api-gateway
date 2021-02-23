import { query } from './login.query';

export const unConfirmedUserToken = async (request, app) => {
  const response = await request(app.getHttpServer())
    .post('/graphql')
    .send({
      query: query,
      variables: {
        input: {
          email: 'charles.williams@yahoo.com',
          password: 'charlesPassword1',
        },
      },
    });

  return await response.body.data.login.accessToken;
};
