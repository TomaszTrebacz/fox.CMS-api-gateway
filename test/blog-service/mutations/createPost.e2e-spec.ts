import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../../src/app.module';
import { adminToken, confirmedUserToken } from 'test/utils';
import * as faker from 'faker';

describe('createPost [mutation](e2e)', () => {
  let app: INestApplication;
  let token: string;
  let postName: string;
  let text: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    token = await adminToken(request, app);
    postName = await faker.lorem.words(5);
    text = await faker.lorem.words(20);
  });

  const mutation =
    'mutation($input: CreatePostInput) { \
        createPost(createPostInput: $input) { \
          id \
          created \
          updated \
        } \
      }';

  describe('if user has permissions & data is valid', () => {
    it('should create and return post', () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${token}`)
        .send({
          query: mutation,
          variables: {
            input: {
              title: postName,
              text: text,
              category: 1,
              imageUrl: 'https://i.ibb.co/znMvxYw/stock3.jpg',
            },
          },
        })
        .expect(200)
        .expect(({ body }) => {
          expect(body.data.createPost).toMatchObject({
            id: expect.any(Number),
            created: expect.any(String),
            updated: expect.any(String),
          });
        });
    });
  });

  describe('otherwise', () => {
    describe('if user is not logged', () => {
      it('should throw the error', () => {
        return request(app.getHttpServer())
          .post('/graphql')
          .send({
            query: mutation,
            variables: {
              input: {
                title: postName,
                text: text,
                category: 1,
                imageUrl: 'https://i.ibb.co/znMvxYw/stock3.jpg',
              },
            },
          })
          .expect(200)
          .expect(res => {
            expect(res.body.errors[0].message).toEqual(`No auth token`);
          });
      });
    });
    describe('if user is not logged as admin or root', () => {
      it('should throw the error', async () => {
        const userToken = await confirmedUserToken(request, app);

        return await request(app.getHttpServer())
          .post('/graphql')
          .set('Authorization', `Bearer ${userToken}`)
          .send({
            query: mutation,
            variables: {
              input: {
                title: postName,
                text: text,
                category: 1,
                imageUrl: 'https://i.ibb.co/znMvxYw/stock3.jpg',
              },
            },
          })
          .expect(200)
          .expect(res => {
            expect(res.body.errors[0].message).toEqual(`Wrong role!`);
          });
      });
    });
    describe('if title is too short', () => {
      it('should throw the error', () => {
        return request(app.getHttpServer())
          .post('/graphql')
          .set('Authorization', `Bearer ${token}`)
          .send({
            query: mutation,
            variables: {
              input: {
                title: 'short',
                text: text,
                category: 1,
                imageUrl: 'https://i.ibb.co/znMvxYw/stock3.jpg',
              },
            },
          })
          .expect(200)
          .expect(res => {
            expect(res.body.errors[0].message).toEqual(
              `title must be longer than or equal to 10 characters`,
            );
          });
      });
    });
    describe('if title is too long', () => {
      it('should throw the error', () => {
        return request(app.getHttpServer())
          .post('/graphql')
          .set('Authorization', `Bearer ${token}`)
          .send({
            query: mutation,
            variables: {
              input: {
                title: 'toolongtitletoolongtitletoolongtitletoolongtitle...',
                text: text,
                category: 1,
                imageUrl: 'https://i.ibb.co/znMvxYw/stock3.jpg',
              },
            },
          })
          .expect(200)
          .expect(res => {
            expect(res.body.errors[0].message).toEqual(
              `title must be shorter than or equal to 50 characters`,
            );
          });
      });
    });
    describe('if text is too short', () => {
      it('should throw the error', () => {
        return request(app.getHttpServer())
          .post('/graphql')
          .set('Authorization', `Bearer ${token}`)
          .send({
            query: mutation,
            variables: {
              input: {
                title: postName,
                text: 'short',
                category: 1,
                imageUrl: 'https://i.ibb.co/znMvxYw/stock3.jpg',
              },
            },
          })
          .expect(200)
          .expect(res => {
            expect(res.body.errors[0].message).toEqual(
              `text must be longer than or equal to 50 characters`,
            );
          });
      });
    });
    describe('if category does not exist', () => {
      it('should throw the error', () => {
        return request(app.getHttpServer())
          .post('/graphql')
          .set('Authorization', `Bearer ${token}`)
          .send({
            query: mutation,
            variables: {
              input: {
                title: postName,
                text: text,
                category: 9999,
                imageUrl: 'notUrl',
              },
            },
          })
          .expect(200)
          .expect(res => {
            expect(res.body.errors[0].message).toEqual(
              `Can not find category with id: 9999`,
            );
          });
      });
    });
    describe('if imageUrl is not an url', () => {
      it('should throw the error', () => {
        return request(app.getHttpServer())
          .post('/graphql')
          .set('Authorization', `Bearer ${token}`)
          .send({
            query: mutation,
            variables: {
              input: {
                title: postName,
                text: text,
                category: 1,
                imageUrl: 'notUrl',
              },
            },
          })
          .expect(200)
          .expect(res => {
            expect(res.body.errors[0].message).toEqual(
              `imageUrl must be an URL address`,
            );
          });
      });
    });
  });
});
