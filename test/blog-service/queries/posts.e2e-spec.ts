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

  it('should return valid array of posts', () => {
    return request(app.getHttpServer())
      .post('/graphql')
      .send({
        query:
          '{ posts { id text title imageUrl created category { id name }user { id firstName lastName }}}',
      })
      .expect(200)
      .expect(({ body }) => {
        expect(body.data.posts).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              id: expect.any(Number),
              title: expect.any(String),
              text: expect.any(String),
              imageUrl: expect.any(String),
              created: expect.any(String),
              user: expect.objectContaining({
                id: expect.any(String),
                firstName: expect.any(String),
                lastName: expect.any(String),
              }),
              category: expect.objectContaining({
                id: expect.any(Number),
                name: expect.any(String),
              }),
            }),
          ]),
        );
      });
  });
});
