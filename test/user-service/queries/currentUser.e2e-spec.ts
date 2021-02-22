import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../../src/app.module';
import { confirmedUserToken, unConfirmedUserToken } from 'test/utils';

describe('currentUser [query](e2e)', () => {
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
        currentUser { \
            id \
            email \
            firstName \
            lastName \
            phoneNumber \
        } \
     }';

  describe('if token of confirmed user is provided', () => {
    it('should return the user', async () => {
      const token = await confirmedUserToken(request, app);

      return await request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${token}`)
        .send({
          query: query,
        })
        .expect(200)
        .expect(({ body }) => {
          expect(body.data.currentUser).toMatchObject({
            id: 'ded8dc2f-ab3b-49a5-8f14-34bf89bc20ca',
            email: 'gary.green@gmail.com',
            firstName: 'Gary',
            lastName: 'Green',
            phoneNumber: '+15005550006',
          });
        });
    });
  });
  describe('if token of UNCONFIRMED user is provided', () => {
    it('should throw the error', async () => {
      const token = await unConfirmedUserToken(request, app);

      return await request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${token}`)
        .send({
          query: query,
        })
        .expect(200)
        .expect(res => {
          expect(res.body.errors[0].message).toEqual(
            'User is not confirmed. Please confirm accout',
          );
        });
    });
  });
  describe('if token has not been provided', () => {
    it('should throw the error', () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: query,
        })
        .expect(200)
        .expect(res => {
          expect(res.body.errors[0].message).toEqual('No auth token');
        });
    });
  });
});
