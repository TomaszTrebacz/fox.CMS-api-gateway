import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../../src/app.module';
import * as faker from 'faker';
import { customUserToken } from 'test/utils';

describe('updateUser [mutation](e2e)', () => {
  let app: INestApplication;
  let token: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    token = await customUserToken(
      request,
      app,
      'thomas.perez@outlook.com',
      'ThomasIsPassword',
    );
  });

  const mutation =
    'mutation ($input: UpdateUserInput) { \
        updateUser(updateUserInput: $input) \
     }';

  describe('if user provided valid data', () => {
    it('should successfully update user and return true', () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${token}`)
        .send({
          query: mutation,
          variables: {
            input: {
              firstName: faker.name.firstName(),
              lastName: faker.name.lastName(),
            },
          },
        })
        .expect(200)
        .expect(({ body }) => {
          expect(body.data.updateUser).toBeTruthy();
        });
    });
  });
  describe('otherwise', () => {
    describe('if user provided too short first name', () => {
      it('should fail and throw the error', () => {
        return request(app.getHttpServer())
          .post('/graphql')
          .set('Authorization', `Bearer ${token}`)
          .send({
            query: mutation,
            variables: {
              input: {
                firstName: 'ma',
                lastName: faker.name.lastName(),
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
          .set('Authorization', `Bearer ${token}`)
          .send({
            query: mutation,
            variables: {
              input: {
                firstName:
                  'toolongfirstNamewhichhas51characters///////////////',
                lastName: faker.name.lastName(),
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
    describe('if user provided too short last name', () => {
      it('should fail and throw the error', () => {
        return request(app.getHttpServer())
          .post('/graphql')
          .set('Authorization', `Bearer ${token}`)
          .send({
            query: mutation,
            variables: {
              input: {
                firstName: faker.name.firstName(),
                lastName: 'la',
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
          .set('Authorization', `Bearer ${token}`)
          .send({
            query: mutation,
            variables: {
              input: {
                firstName: faker.name.firstName(),
                lastName: 'toolonglastNamewhichhas51characters////////////////',
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
  });
});
