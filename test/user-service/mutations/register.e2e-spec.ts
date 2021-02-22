import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../../src/app.module';
import * as faker from 'faker';

describe('register [mutation](e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  const mutation =
    'mutation ($input: CreateUserInput) { \
        registerUser(createUserInput: $input) { \
          id \
          password \
          created \
          updated \
        } \
      }';

  describe('if user provided valid data', () => {
    it('should successfully register and return data', () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: mutation,
          variables: {
            input: {
              email: faker.internet.email(),
              firstName: faker.name.firstName(),
              lastName: faker.name.lastName(),
              password: faker.internet.password(),
              phoneNumber: faker.phone.phoneNumberFormat(),
            },
          },
        })
        .expect(200)
        .expect(({ body }) => {
          expect(body.data.registerUser).toEqual({
            id: expect.any(String),
            password: expect.any(String),
            created: expect.any(String),
            updated: expect.any(String),
          });
        });
    });
  });
  describe('otherwise', () => {
    describe('if user provided invalid email', () => {
      it('should fail and throw the error', () => {
        return request(app.getHttpServer())
          .post('/graphql')
          .send({
            query: mutation,
            variables: {
              input: {
                email: 'notEmail',
                firstName: faker.name.firstName(),
                lastName: faker.name.lastName(),
                password: faker.internet.password(),
                phoneNumber: faker.phone.phoneNumberFormat(),
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
    describe('if user provided existing email', () => {
      it('should fail and throw the error', () => {
        return request(app.getHttpServer())
          .post('/graphql')
          .send({
            query: mutation,
            variables: {
              input: {
                email: 'gary.green@gmail.com',
                firstName: faker.name.firstName(),
                lastName: faker.name.lastName(),
                password: faker.internet.password(),
                phoneNumber: faker.phone.phoneNumberFormat(),
              },
            },
          })
          .expect(200)
          .expect(res => {
            expect(res.body.errors[0].message).toEqual('EMAIL is in use!');
          });
      });
    });
    describe('if user provided too short first name', () => {
      it('should fail and throw the error', () => {
        return request(app.getHttpServer())
          .post('/graphql')
          .send({
            query: mutation,
            variables: {
              input: {
                email: faker.internet.email(),
                firstName: 'ja',
                lastName: faker.name.lastName(),
                password: faker.internet.password(),
                phoneNumber: faker.phone.phoneNumberFormat(),
              },
            },
          })
          .expect(200)
          .expect(res => {
            expect(res.body.errors[0].message).toEqual(
              'firstName must be longer than or equal to 3 characters',
            );
          });
      });
    });
    describe('if user provided too long first name', () => {
      it('should fail and throw the error', () => {
        return request(app.getHttpServer())
          .post('/graphql')
          .send({
            query: mutation,
            variables: {
              input: {
                email: faker.internet.email(),
                firstName:
                  'toolongfirstNamewhichhas51characters///////////////',
                lastName: faker.name.lastName(),
                password: faker.internet.password(),
                phoneNumber: faker.phone.phoneNumberFormat(),
              },
            },
          })
          .expect(200)
          .expect(res => {
            expect(res.body.errors[0].message).toEqual(
              'firstName must be shorter than or equal to 50 characters',
            );
          });
      });
    });
    describe('if user provided too short first name', () => {
      it('should fail and throw the error', () => {
        return request(app.getHttpServer())
          .post('/graphql')
          .send({
            query: mutation,
            variables: {
              input: {
                email: faker.internet.email(),
                firstName: faker.name.firstName(),
                lastName: 'ja',
                password: faker.internet.password(),
                phoneNumber: faker.phone.phoneNumberFormat(),
              },
            },
          })
          .expect(200)
          .expect(res => {
            expect(res.body.errors[0].message).toEqual(
              'lastName must be longer than or equal to 3 characters',
            );
          });
      });
    });
    describe('if user provided too long last name', () => {
      it('should fail and throw the error', () => {
        return request(app.getHttpServer())
          .post('/graphql')
          .send({
            query: mutation,
            variables: {
              input: {
                email: faker.internet.email(),
                firstName: faker.name.firstName(),
                lastName: 'toolonglastNamewhichhas51characters////////////////',
                password: faker.internet.password(),
                phoneNumber: faker.phone.phoneNumberFormat(),
              },
            },
          })
          .expect(200)
          .expect(res => {
            expect(res.body.errors[0].message).toEqual(
              'lastName must be shorter than or equal to 50 characters',
            );
          });
      });
    });
    describe('if user provided too short password', () => {
      it('should fail and throw the error', () => {
        return request(app.getHttpServer())
          .post('/graphql')
          .send({
            query: mutation,
            variables: {
              input: {
                email: faker.internet.email(),
                firstName: faker.name.firstName(),
                lastName: faker.name.lastName(),
                password: 'short',
                phoneNumber: faker.phone.phoneNumberFormat(),
              },
            },
          })
          .expect(200)
          .expect(res => {
            expect(res.body.errors[0].message).toEqual(
              'password must be longer than or equal to 8 characters',
            );
          });
      });
    });
    describe('if user provided too long password', () => {
      it('should fail and throw the error', () => {
        return request(app.getHttpServer())
          .post('/graphql')
          .send({
            query: mutation,
            variables: {
              input: {
                email: faker.internet.email(),
                firstName: faker.name.firstName(),
                lastName: faker.name.lastName(),
                password: `
                  toolongpasswordwhichhas129characterstoolongpasswordwhichhas129characters
                  toolongpasswordwhichhas129characterstoolongpasswordwhichhas129characters
                  `,
                phoneNumber: faker.phone.phoneNumberFormat(),
              },
            },
          })
          .expect(200)
          .expect(res => {
            expect(res.body.errors[0].message).toEqual(
              'password must be shorter than or equal to 128 characters',
            );
          });
      });
    });
    describe('if user provided invalid mobile phone', () => {
      it('should fail and throw the error', () => {
        return request(app.getHttpServer())
          .post('/graphql')
          .send({
            query: mutation,
            variables: {
              input: {
                email: faker.internet.email(),
                firstName: faker.name.firstName(),
                lastName: faker.name.lastName(),
                password: faker.internet.password(),
                phoneNumber: 'notmobilephone',
              },
            },
          })
          .expect(200)
          .expect(res => {
            expect(res.body.errors[0].message).toEqual(
              'phoneNumber must be a phone number',
            );
          });
      });
    });
    describe('if user provided existing mobile phone', () => {
      it('should fail and throw the error', () => {
        return request(app.getHttpServer())
          .post('/graphql')
          .send({
            query: mutation,
            variables: {
              input: {
                email: faker.internet.email(),
                firstName: faker.name.firstName(),
                lastName: faker.name.lastName(),
                password: faker.internet.password(),
                phoneNumber: '+15005550006',
              },
            },
          })
          .expect(200)
          .expect(res => {
            expect(res.body.errors[0].message).toEqual(
              'PHONENUMBER is in use!',
            );
          });
      });
    });
  });
});
