import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../../src/app.module';

describe('category [query](e2e)', () => {
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
        category(id: $id) { \
          name \
        } \
      }';

  describe('if category with provided id exists', () => {
    it('should return the category', () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: query,
          variables: {
            id: 3,
          },
        })
        .expect(200)
        .expect(({ body }) => {
          expect(body.data.category).toMatchObject({
            name: 'Food',
          });
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
              id: 9999,
            },
          })
          .expect(200)
          .expect(res => {
            expect(res.body.errors[0].message).toEqual(
              'Can not find category with id: 9999',
            );
          });
      });
    });
  });
});
