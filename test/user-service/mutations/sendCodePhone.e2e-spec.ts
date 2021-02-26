import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../../src/app.module';

describe('sendCodePhone [mutation](e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  const mutation =
    'mutation ($phone: String!) { \
      sendCodePhone(phoneNumber: $phone) \
    }';

  describe('if user provided existing phone number', () => {
    it('should successfully send code and return true', () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: mutation,
          variables: {
            phone: '+48667532860',
          },
        })
        .expect(200)
        .expect(({ body }) => {
          expect(body.data.sendCodePhone).toBeTruthy();
        });
    }, 20000);
  });
  describe('otherwise', () => {
    it('should throw the error', () => {
      const notExistingPhone = '+48732033458';

      return request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: mutation,
          variables: {
            phone: notExistingPhone,
          },
        })
        .expect(200)
        .expect(res => {
          expect(res.body.errors[0].message).toEqual(
            `Can not send confirmation code: Can not find user with phone: ${notExistingPhone}`,
          );
        });
    });
  });
});
