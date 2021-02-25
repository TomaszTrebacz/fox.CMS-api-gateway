import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../../src/app.module';
import { adminToken, confirmedUserToken } from 'test/utils';

describe('deleteUser [mutation](e2e)', () => {
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
    'mutation($id: String) { \
        deleteUser(id: $id) \
     }';

  describe('if user exists', () => {
    it('should delete user from both databases and return true', async () => {
      return await request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${token}`)
        .send({
          query: mutation,
          variables: {
            id: '68a92a55-d374-4788-a739-d4fd82cacdac',
          },
        })
        .expect(200)
        .expect(({ body }) => {
          expect(body.data.deleteUser).toBeTruthy();
        });
    });
  });

  describe('otherwise', () => {
    const invalidID = 'cb470b51-3764-4300-8237-59e7b7c13166';

    describe('if admin tried to delete root', () => {
      it('should throw the error', () => {
        const rootID = '2bac1170-827d-49ad-b7a3-9c76e6ad83e9';
        return request(app.getHttpServer())
          .post('/graphql')
          .set('Authorization', `Bearer ${token}`)
          .send({
            query: mutation,
            variables: {
              id: rootID,
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
    describe('if admin tried to delete another admin', () => {
      it('should throw the error', () => {
        const adminID = '3d248dbc-4475-46e1-8361-6273d0f1fa9c';
        return request(app.getHttpServer())
          .post('/graphql')
          .set('Authorization', `Bearer ${token}`)
          .send({
            query: mutation,
            variables: {
              id: adminID,
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
              id: invalidID,
            },
          })
          .expect(200)
          .expect(res => {
            expect(res.body.errors[0].message).toEqual(
              `Can not fetch role property from user with id: ${invalidID}`,
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
              id: invalidID,
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
              id: invalidID,
            },
          })
          .expect(200)
          .expect(res => {
            expect(res.body.errors[0].message).toEqual(`Wrong role!`);
          });
      });
    });
  });
});
