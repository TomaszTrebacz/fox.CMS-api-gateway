import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../../src/app.module';
import { customUserToken } from 'test/utils';

describe('sendChangePhoneEmail [mutation](e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  const mutation =
    'mutation($phone: String) { \
        sendChangePhoneEmail(phoneNumber: $phone) \
     }';

  describe('if user is logged', () => {
    it('should send email with token and return true', async () => {
      const token = await customUserToken(
        request,
        app,
        'alexander.lewis@gmail.com',
        'examplePassword1',
      );

      return request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${token}`)
        .send({
          query: mutation,
          variables: {
            phone: '+48421345787',
          },
        })
        .expect(200)
        .expect(({ body }) => {
          expect(body.data.sendChangePhoneEmail).toBeTruthy();
        });
    });
  });

  describe('otherwise', () => {
    describe('if user is not logged in', () => {
      it('should throw the error', () => {
        return request(app.getHttpServer())
          .post('/graphql')
          .send({
            query: mutation,
            variables: {
              phoneNumber: '+15005550006',
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
