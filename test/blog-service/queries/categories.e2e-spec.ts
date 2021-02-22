import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../../src/app.module';

describe('posts [query](e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  const query =
    'query { \
        categories { \
            name \
            posts { \
                title \
                text \
            } \
        } \
    }';

  it('should return valid array of categories', () => {
    return request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: query,
      })
      .expect(200)
      .expect(({ body }) => {
        expect(body.data.categories).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              name: expect.any(String),
              posts: expect.arrayContaining([
                expect.objectContaining({
                  title: expect.any(String),
                  text: expect.any(String),
                }),
              ]),
            }),
          ]),
        );
      });
  });
});
