import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../../src/app.module';

describe('user [query](e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  const query =
    'query($id: String!) { \
        user(id: $id) { \
          firstName \
          lastName \
          phoneNumber \
          created \
        } \
      } \
      ';

  describe('if user exists', () => {
    it('should return the user', () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: query,
          variables: {
            id: '8055d923-0cfd-40e9-879e-638e8ffc7475',
          },
        })
        .expect(200)
        .expect(({ body }) => {
          expect(body.data.user).toMatchObject({
            firstName: 'Charles',
            lastName: 'Williams',
            phoneNumber: '+15005550006',
            created: '2021-02-16',
          });
        });
    });
  });
  describe('otherwise', () => {
    describe('if user with provided id does not exist', () => {
      it('should throw the error', () => {
        return request(app.getHttpServer())
          .post('/graphql')
          .send({
            query: query,
            variables: {
              id: '3c248dbc-4475-46e1-8361-6273d0f1fa9c',
            },
          })
          .expect(200)
          .expect(res => {
            expect(res.body.errors[0].message).toBeDefined();
          });
      });
    });
  });
});
