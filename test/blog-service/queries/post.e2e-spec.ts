import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../../src/app.module';

describe('post [query](e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  const query =
    'query ($id: Int!) { \
        post(id:$id) { \
          id \
          title \
          user { \
            firstName \
            lastName \
          } \
          category { \
            name \
          } \
        } \
      }';

  describe('if post with id exists', () => {
    it('should return the post', () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: query,
          variables: {
            id: 1,
          },
        })
        .expect(200)
        .expect(({ body }) => {
          expect(body.data.post).toEqual(
            expect.objectContaining({
              id: 1,
              title: 'Oh right. I forgot about the battle.',
              user: expect.objectContaining({
                firstName: 'Charles',
                lastName: 'Williams',
              }),
              category: expect.objectContaining({
                name: 'Travel',
              }),
            }),
          );
        });
    });
  });
  describe('otherwise', () => {
    describe('if post with id does not exist', () => {
      it('should throw the error', () => {
        return request(app.getHttpServer())
          .post('/graphql')
          .send({
            query: query,
            variables: {
              id: 99999,
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
