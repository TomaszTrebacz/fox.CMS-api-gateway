import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../../src/app.module';
import { adminToken, rootToken } from 'test/utils';

describe('deleteUserPosts [mutation](e2e)', () => {
  let app: INestApplication;
  let token: String;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    token = await rootToken(request, app);
  });

  const mutation =
    'mutation($id: String!) { \
        deleteUserPosts(id: $id) \
     }';

  describe('if posts exists and user is logged as root', () => {
    it('should delete posts from database and return true', () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${token}`)
        .send({
          query: mutation,
          variables: {
            id: '3d248dbc-4475-46e1-8361-6273d0f1fa9c',
          },
        })
        .expect(200)
        .expect(({ body }) => {
          console.log(body.data);
          expect(body.data.deleteUserPosts).toBeTruthy();
        });
    });
  });

  describe('otherwise', () => {
    describe('if user is logged as admin', () => {
      it('should throw the error', async () => {
        const adminJWT = await adminToken(request, app);

        return await request(app.getHttpServer())
          .post('/graphql')
          .set('Authorization', `Bearer ${adminJWT}`)
          .send({
            query: mutation,
            variables: {
              id: '3d248dbc-4475-46e1-8361-6273d0f1fa9c',
            },
          })
          .expect(200)
          .expect(res => {
            expect(res.body.errors[0].message).toEqual(
              `You can not change any properties of accounts with admin or root permissions!`,
            );
          });
      });
    });
    describe('if user does not exist', () => {
      it('should throw the error', () => {
        return request(app.getHttpServer())
          .post('/graphql')
          .set('Authorization', `Bearer ${token}`)
          .send({
            query: mutation,
            variables: {
              id: '4dc0141f-cca4-4eda-a9d2-8832f94e9a98',
            },
          })
          .expect(200)
          .expect(res => {
            expect(res.body.errors[0].message).toEqual(
              `There is no user with given Id!`,
            );
          });
      });
    });
    describe('if user has not posts', () => {
      it('should throw the error', () => {
        return request(app.getHttpServer())
          .post('/graphql')
          .set('Authorization', `Bearer ${token}`)
          .send({
            query: mutation,
            variables: {
              id: 'f3690628-088d-451a-b6a4-7887d5a3257f',
            },
          })
          .expect(200)
          .expect(res => {
            expect(res.body.errors[0].message).toEqual(
              `Can not delete posts related to user with id - f3690628-088d-451a-b6a4-7887d5a3257f: Database/ORM error.`,
            );
          });
      });
    });
    describe('if user is not logged', () => {
      it('should throw the error', () => {
        return request(app.getHttpServer())
          .post('/graphql')
          .send({
            query: mutation,
            variables: {
              id: '3d248dbc-4475-46e1-8361-6273d0f1fa9c',
            },
          })
          .expect(200)
          .expect(res => {
            expect(res.body.errors[0].message).toEqual(`No auth token`);
          });
      });
    });
  });
});
