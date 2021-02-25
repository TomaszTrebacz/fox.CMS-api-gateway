import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../../src/app.module';
import { adminToken, confirmedUserToken } from 'test/utils';

describe('users [query](e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  const query =
    'query { \
        users { \
            id \
            email \
            firstName \
            lastName \
            phoneNumber \
        } \
    }';

  describe('is user is logged as admin or root', () => {
    it('should return valid array of categories', async () => {
      const token = await adminToken(request, app);

      return await request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${token}`)
        .send({
          query: query,
        })
        .expect(200)
        .expect(({ body }) => {
          expect(body.data.users).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                id: expect.any(String),
                email: expect.any(String),
                firstName: expect.any(String),
                lastName: expect.any(String),
                phoneNumber: expect.any(String),
              }),
            ]),
          );
        });
    });
  });
  describe('otherwise', () => {
    describe('is user is not logged as admin or root', () => {
      it('should throw the error', async () => {
        const token = await confirmedUserToken(request, app);

        return await request(app.getHttpServer())
          .post('/graphql')
          .set('Authorization', `Bearer ${token}`)
          .send({
            query: query,
          })
          .expect(200)
          .expect(res => {
            expect(res.body.errors[0].message).toEqual(`Wrong role!`);
          });
      });
    });
    describe('is user is not logged', () => {
      it('should throw the error', () => {
        return request(app.getHttpServer())
          .post('/graphql')
          .send({
            query: query,
          })
          .expect(200)
          .expect(res => {
            expect(res.body.errors[0].message).toEqual(`No auth token`);
          });
      });
    });
  });
});
