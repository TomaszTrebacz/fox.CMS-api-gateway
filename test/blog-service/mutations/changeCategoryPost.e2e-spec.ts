import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../../src/app.module';
import { adminToken, confirmedUserToken } from 'test/utils';

describe('changeCategoryPost [mutation](e2e)', () => {
  let app: INestApplication;
  let token: String;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    token = await adminToken(request, app);
  });

  const mutation =
    'mutation($input: ChangeCategoryPostInput) { \
        changeCategoryPost(changeCategoryPostInput: $input) \
      }';

  describe('if user has permissions & data is valid', () => {
    it('should return true', () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${token}`)
        .send({
          query: mutation,
          variables: {
            input: {
              id: 3,
              category: 2,
            },
          },
        })
        .expect(200)
        .expect(({ body }) => {
          expect(body.data.changeCategoryPost).toBeTruthy();
        });
    });
  });

  describe('otherwise', () => {
    describe('if user is not logged', () => {
      it('should throw the error', () => {
        return request(app.getHttpServer())
          .post('/graphql')
          .send({
            query: mutation,
            variables: {
              input: {
                id: 3,
                category: 2,
              },
            },
          })
          .expect(200)
          .expect(res => {
            expect(res.body.errors[0].message).toEqual(`No auth token`);
          });
      });
    });
    describe('if user is not logged as admin or root', () => {
      it('should throw the error', async () => {
        const userToken = await confirmedUserToken(request, app);

        return await request(app.getHttpServer())
          .post('/graphql')
          .set('Authorization', `Bearer ${userToken}`)
          .send({
            query: mutation,
            variables: {
              input: {
                id: 3,
                category: 2,
              },
            },
          })
          .expect(200)
          .expect(res => {
            expect(res.body.errors[0].message).toEqual(`Wrong role!`);
          });
      });
    });
    describe('if post does not exist', () => {
      it('should throw the error', () => {
        return request(app.getHttpServer())
          .post('/graphql')
          .set('Authorization', `Bearer ${token}`)
          .send({
            query: mutation,
            variables: {
              input: {
                id: 99999,
                category: 2,
              },
            },
          })
          .expect(res => {
            expect(res.body.errors[0].message).toBeDefined();
          });
      });
    });
    describe('if category does not exist', () => {
      it('should throw the error', () => {
        return request(app.getHttpServer())
          .post('/graphql')
          .set('Authorization', `Bearer ${token}`)
          .send({
            query: mutation,
            variables: {
              input: {
                id: 3,
                category: 9999,
              },
            },
          })
          .expect(res => {
            expect(res.body.errors[0].message).toEqual(
              'Can not find category with id: 9999',
            );
          });
      });
    });
  });
});
