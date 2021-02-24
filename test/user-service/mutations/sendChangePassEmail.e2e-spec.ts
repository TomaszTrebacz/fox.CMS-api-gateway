import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../../src/app.module';

describe('sendChangePassEmail [mutation](e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  const mutation =
    'mutation($email: String) { \
        sendChangePassEmail(email: $email) \
     }';

  describe('if user exists', () => {
    it('should return true', () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: mutation,
          variables: {
            email: 'gary.green@gmail.com',
          },
        })
        .expect(200)
        .expect(({ body }) => {
          expect(body.data.sendChangePassEmail).toBeTruthy();
        });
    });
  });

  describe('otherwise', () => {
    describe('if user does not exist', () => {
      it('should throw the error', () => {
        const notExistingEmail = 'notExisting@email.com';

        return request(app.getHttpServer())
          .post('/graphql')
          .send({
            query: mutation,
            variables: {
              email: notExistingEmail,
            },
          })
          .expect(200)
          .expect(res => {
            expect(res.body.errors[0].message).toEqual(
              `Can not send mail with link to change password: Wrong email!`,
            );
          });
      });
    });
  });
});
