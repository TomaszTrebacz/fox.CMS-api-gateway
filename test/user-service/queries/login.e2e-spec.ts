import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../../src/app.module';
import { regexJWT } from '../../utils';

describe('login [query](e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  const query =
    'query ($input: LoginInput) { \
        login(loginCredentials: $input) { \
            user { \
                firstName \
                lastName \
            } \
            accessToken \
            refreshToken \
            role \
        }\
     }';

  describe('if user provided valid data', () => {
    it('should successfully login and return user with access & refresh token', () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: query,
          variables: {
            input: {
              email: 'charles.williams@yahoo.com',
              password: 'charlesPassword1',
            },
          },
        })
        .expect(200)
        .expect(({ body }) => {
          expect(body.data.login).toMatchObject({
            user: {
              firstName: 'Charles',
              lastName: 'Williams',
            },
            accessToken: expect.stringMatching(regexJWT),
            refreshToken: expect.stringMatching(regexJWT),
            role: 'user',
          });
        });
    });
  });
  describe('if user provided uppercase email', () => {
    it('should successfully login and return user with access & refresh token', () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: query,
          variables: {
            input: {
              email: 'CHARLES.WILLIAMS@yahoo.com',
              password: 'charlesPassword1',
            },
          },
        })
        .expect(200)
        .expect(({ body }) => {
          expect(body.data.login).toMatchObject({
            user: {
              firstName: 'Charles',
              lastName: 'Williams',
            },
            accessToken: expect.stringMatching(regexJWT),
            refreshToken: expect.stringMatching(regexJWT),
            role: 'user',
          });
        });
    });
  });
  describe('otherwise', () => {
    describe('if user did not provide valid email', () => {
      describe('if user provided wrong email', () => {
        it('should throw the error', () => {
          return request(app.getHttpServer())
            .post('/graphql')
            .send({
              query: query,
              variables: {
                input: {
                  email: 'wrong@email.com',
                  password: 'charlesPassword1',
                },
              },
            })
            .expect(200)
            .expect(res => {
              expect(res.body.errors[0].message).toEqual(
                'Can not sign in: Wrong email!',
              );
            });
        });
      });
      describe('if user did not provide actually email', () => {
        it('should throw the error', () => {
          return request(app.getHttpServer())
            .post('/graphql')
            .send({
              query: query,
              variables: {
                input: {
                  email: 'charles',
                  password: 'charlesPassword1',
                },
              },
            })
            .expect(200)
            .expect(res => {
              expect(res.body.errors[0].message).toEqual(
                'email must be an email',
              );
            });
        });
      });
    });
    describe('if user did not provide valid password', () => {
      describe('if user provided wrong password', () => {
        it('should throw the error', () => {
          return request(app.getHttpServer())
            .post('/graphql')
            .send({
              query: query,
              variables: {
                input: {
                  email: 'charles.williams@yahoo.com',
                  password: 'wrongPassword',
                },
              },
            })
            .expect(200)
            .expect(res => {
              expect(res.body.errors[0].message).toEqual(
                'Can not sign in: Wrong password!',
              );
            });
        });
      });
      describe('if password is too short', () => {
        it('should throw the error', () => {
          return request(app.getHttpServer())
            .post('/graphql')
            .send({
              query: query,
              variables: {
                input: {
                  email: 'charles.williams@yahoo.com',
                  password: 'ch',
                },
              },
            })
            .expect(200)
            .expect(res => {
              expect(res.body.errors[0].message).toEqual(
                'password must be longer than or equal to 3 characters',
              );
            });
        });
      });
      describe('if password is too long', () => {
        it('should throw the error', () => {
          return request(app.getHttpServer())
            .post('/graphql')
            .send({
              query: query,
              variables: {
                input: {
                  email: 'charles.williams@yahoo.com',
                  password: 'toolongpasswordtoolongpassword1',
                },
              },
            })
            .expect(200)
            .expect(res => {
              expect(res.body.errors[0].message).toEqual(
                'password must be shorter than or equal to 30 characters',
              );
            });
        });
      });
    });
  });
});
