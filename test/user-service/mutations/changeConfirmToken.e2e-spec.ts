import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../../src/app.module';

describe('changeConfirmToken [mutation](e2e)', () => {
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
        changeConfirmToken(email: $email) \
     }';

  describe('if user is not confirmed', () => {
    it('should return true', () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: mutation,
          variables: {
            email: 'kevin.moore@outlook.com',
          },
        })
        .expect(200)
        .expect(({ body }) => {
          expect(body.data.changeConfirmToken).toBeTruthy();
        });
    });
  });

  describe('otherwise', () => {
    describe('if user is confirmed', () => {
      it('should throw the error', () => {
        return request(app.getHttpServer())
          .post('/graphql')
          .send({
            query: mutation,
            variables: {
              email: 'alexander.lewis@gmail.com',
            },
          })
          .expect(200)
          .expect(res => {
            expect(res.body.errors[0].message).toEqual(
              `Can not resend confirmation link: User has been confirmed earlier.`,
            );
          });
      });
    });
    describe('if user does not exist', () => {
      it('should throw the error', () => {
        return request(app.getHttpServer())
          .post('/graphql')
          .send({
            query: mutation,
            variables: {
              email: 'notexistingemail@gmail.com',
            },
          })
          .expect(200)
          .expect(res => {
            expect(res.body.errors[0].message).toEqual(
              `Can not resend confirmation link: Wrong email!`,
            );
          });
      });
    });
  });
});
