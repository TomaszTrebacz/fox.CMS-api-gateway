import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../../src/app.module';

describe('resetPassword [mutation](e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  const mutation =
    'mutation($input: ResetPasswordInput) { \
        resetPassword(resetPasswordInput: $input) \
     }';

  describe('if user provided valid phone number and invalid code', () => {
    it('should successfully reset password and return true', () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: mutation,
          variables: {
            input: {
              phoneNumber: '+48722717428',
              code: 3951,
            },
          },
        })
        .expect(200)
        .expect(res => {
          expect(res.body.errors[0].message).toEqual(
            `Can not reset password: Wrong code.`,
          );
        });
    });
  });
  describe('if user provided valid phone number & code', () => {
    it('should successfully reset password and return true', () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: mutation,
          variables: {
            input: {
              phoneNumber: '+48722717428',
              code: 3961,
            },
          },
        })
        .expect(200)
        .expect(({ body }) => {
          expect(body.data.resetPassword).toBeTruthy();
        });
    }, 50000);
  });
  describe('otherwise', () => {
    describe('if user tried again to reset password', () => {
      it('should throw an error', () => {
        return request(app.getHttpServer())
          .post('/graphql')
          .send({
            query: mutation,
            variables: {
              input: {
                phoneNumber: '+48722717428',
                code: 3961,
              },
            },
          })
          .expect(200)
          .expect(res => {
            expect(res.body.errors[0].message).toEqual(
              'Can not reset password: Can not fetch codetoken property from user with id: e27d6987-0c60-42ba-8dee-36a1b09d08f1',
            );
          });
      });
    });
    describe('if user provided not existing phone number', () => {
      it('should throw an error', () => {
        const notExistingPhone = '+48632042349';

        return request(app.getHttpServer())
          .post('/graphql')
          .send({
            query: mutation,
            variables: {
              input: {
                phoneNumber: notExistingPhone,
                code: 3961,
              },
            },
          })
          .expect(200)
          .expect(res => {
            expect(res.body.errors[0].message).toEqual(
              `Can not reset password: Can not find user with phone: ${notExistingPhone}`,
            );
          });
      });
    });
    describe('if user provided invalid phone number', () => {
      it('should throw an error', () => {
        const notPhone = '2349';

        return request(app.getHttpServer())
          .post('/graphql')
          .send({
            query: mutation,
            variables: {
              input: {
                phoneNumber: notPhone,
                code: 3961,
              },
            },
          })
          .expect(200)
          .expect(res => {
            expect(res.body.errors[0].message).toEqual(
              'phoneNumber must be a phone number',
            );
          });
      });
    });
  });
});
