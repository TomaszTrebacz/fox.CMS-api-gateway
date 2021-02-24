import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../../src/app.module';

describe('refreshToken [mutation](e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  const mutation =
    'mutation ($token: String) { \
        refreshToken(refreshToken: $token) { \
          accessToken \
          refreshToken \
        } \
      }';

  describe('if refresh token is valid', () => {
    it('should return new pair of tokens', async () => {
      // sign in & get valid refresh token
      const loginQuery =
        'query ($input: LoginInput) { \
             login(loginCredentials: $input) { \
                 accessToken \
                 refreshToken \
             }\
         }';

      const res = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: loginQuery,
          variables: {
            input: {
              email: 'charles.williams@yahoo.com',
              password: 'charlesPassword1',
            },
          },
        });

      const refreshToken = res.body.data.login.refreshToken;

      return await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: mutation,
          variables: {
            token: refreshToken,
          },
        })
        .expect(200)
        .expect(({ body }) => {
          expect(body.data.refreshToken).toEqual({
            accessToken: expect.any(String),
            refreshToken: expect.any(String),
          });
        });
    });
  });

  describe('otherwise', () => {
    describe('if refresh token is not valid', () => {
      it('should throw the error', () => {
        return request(app.getHttpServer())
          .post('/graphql')
          .send({
            query: mutation,
            variables: {
              token:
                'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
            },
          })
          .expect(200)
          .expect(res => {
            expect(res.body.errors[0].message).toEqual(
              `Can not send new pair of tokens: Unauthorized`,
            );
          });
      });
    });
  });
});
