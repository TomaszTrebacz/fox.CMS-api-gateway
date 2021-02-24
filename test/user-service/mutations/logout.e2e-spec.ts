import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../../src/app.module';

describe('logout [mutation](e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  const mutation = 'mutation($id: String) { \
        logout(id: $id) \
     }';

  describe('if user is logged', () => {
    it('should return true', () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: mutation,
          variables: {
            id: '8055d923-0cfd-40e9-879e-638e8ffc7475',
          },
        })
        .expect(200)
        .expect(({ body }) => {
          expect(body.data.logout).toBeTruthy();
        });
    });
  });

  describe('otherwise', () => {
    describe('if user is not logged or does not exist', () => {
      it('should throw the error', () => {
        const invalidID = 'cb470b51-3764-4300-8237-59e7b7c13166';

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
            expect(res.body.errors[0].message).toEqual(
              `Can not log out: Can not delete refreshtoken property from user with id: ${invalidID}`,
            );
          });
      });
    });
  });
});
