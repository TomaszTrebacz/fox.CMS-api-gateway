import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../../src/app.module';
import { confirmedUserToken } from 'test/utils';

describe('changePassByToken [mutation](e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  const mutation =
    'mutation($password: String) { \
        changePassword(password: $password) \
      }';

  describe('if user is logged', () => {
    it('should change password and return true', async () => {
      const token = await confirmedUserToken(request, app);

      return request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${token}`)
        .send({
          query: mutation,
          variables: {
            password: 'garyPassword1',
          },
        })
        .expect(200)
        .expect(({ body }) => {
          expect(body.data.changePassword).toBeTruthy();
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
              password: 'garyPassword1',
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
