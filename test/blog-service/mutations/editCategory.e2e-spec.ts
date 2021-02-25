import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../../src/app.module';
import { adminToken, confirmedUserToken } from 'test/utils';
import * as faker from 'faker';

describe('editCategory [mutation](e2e)', () => {
  let app: INestApplication;
  let token: String;
  let categoryName: String;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    token = await adminToken(request, app);
    categoryName = await faker.lorem.words(2);
  });

  const mutation =
    'mutation($input: EditCategoryInput) { \
        editCategory(editCategoryInput: $input) \
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
              id: 4,
              name: categoryName,
            },
          },
        })
        .expect(200)
        .expect(({ body }) => {
          expect(body.data.editCategory).toBeTruthy();
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
                id: 4,
                name: categoryName,
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
                id: 4,
                name: categoryName,
              },
            },
          })
          .expect(200)
          .expect(res => {
            expect(res.body.errors[0].message).toEqual(`Wrong role!`);
          });
      });
    });
    describe('if name is too short', () => {
      it('should throw the error', () => {
        return request(app.getHttpServer())
          .post('/graphql')
          .set('Authorization', `Bearer ${token}`)
          .send({
            query: mutation,
            variables: {
              input: {
                id: 4,
                name: 'na',
              },
            },
          })
          .expect(200)
          .expect(res => {
            expect(res.body.errors[0].message).toEqual(
              `name must be longer than or equal to 3 characters`,
            );
          });
      });
    });
    describe('if name is too short', () => {
      it('should throw the error', () => {
        return request(app.getHttpServer())
          .post('/graphql')
          .set('Authorization', `Bearer ${token}`)
          .send({
            query: mutation,
            variables: {
              input: {
                id: 4,
                name: 'toolongnametoolongname',
              },
            },
          })
          .expect(200)
          .expect(res => {
            expect(res.body.errors[0].message).toEqual(
              `name must be shorter than or equal to 20 characters`,
            );
          });
      });
    });
    describe('if name is not unique', () => {
      it('should throw the error', () => {
        return request(app.getHttpServer())
          .post('/graphql')
          .set('Authorization', `Bearer ${token}`)
          .send({
            query: mutation,
            variables: {
              input: {
                id: 4,
                name: 'Productivity',
              },
            },
          })
          .expect(200)
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
                id: 999,
                name: categoryName,
              },
            },
          })
          .expect(200)
          .expect(res => {
            expect(res.body.errors[0].message).toEqual(
              'Can not find category with id: 999',
            );
          });
      });
    });
  });
});
