import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../../src/app.module';

describe('userPosts [query](e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  const query =
    'query ($id: String!) { \
        userPosts(id: $id) { \
          id \
          title \
          text \
          imageUrl \
          category { \
            name \
          } \
        } \
      }';

  describe('if posts exist', () => {
    it('should return the posts', () => {
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
          expect(body.data.userPosts).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                id: expect.any(Number),
                title: expect.any(String),
                text: expect.any(String),
                imageUrl: expect.any(String),
                category: expect.objectContaining({
                  name: expect.any(String),
                }),
              }),
            ]),
          );
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
              id: 'ff5ea6b9-62fc-46b0-ab39-93bb724b8007',
            },
          })
          .expect(200)
          .expect(res => {
            expect(res.body.errors[0].message).toEqual(
              'Can not find any data.',
            );
          });
      });
    });
    describe('if user has not any posts', () => {
      it('should throw the error', () => {
        return request(app.getHttpServer())
          .post('/graphql')
          .send({
            query: query,
            variables: {
              id: 'd0d8dc2f-ab3b-49a5-8f14-34bf89bc20ca',
            },
          })
          .expect(200)
          .expect(res => {
            expect(res.body.errors[0].message).toEqual(
              'Can not find any data.',
            );
          });
      });
    });
  });
});
