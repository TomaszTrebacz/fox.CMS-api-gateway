import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../../src/app.module';
import { adminToken, confirmedUserToken } from 'test/utils';
import * as faker from 'faker';

describe('editPost [mutation](e2e)', () => {
  let app: INestApplication;
  let token: String;
  let postName: String;
  let text: String;

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
    'mutation($input: EditPostInput) { \
        editPost(editPostInput: $input) \
      }';

  describe('if user has permissions & data is valid', () => {
    it('should return true', () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${token}`)
        .send({
          query: mutation,
          variables: {
            input: {
              id: 4,
              title: postName,
              text: text,
            },
          },
        })
        .expect(200)
        .expect(({ body }) => {
          expect(body.data.editPost).toBeTruthy();
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
                id: 1,
                title: postName,
                text: text,
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
                id: 1,
                title: postName,
                text: text,
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
                id: 1,
                title: 'short',
                text: text,
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
                id: 1,
                title: 'toolongtitletoolongtitletoolongtitletoolongtitle...',
                text: text,
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
                id: 1,
                title: postName,
                text: 'short',
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
    describe('if post does not exist', () => {
      it('should throw the error', () => {
        return request(app.getHttpServer())
          .post('/graphql')
          .set('Authorization', `Bearer ${token}`)
          .send({
            query: mutation,
            variables: {
              input: {
                id: 999,
                title: postName,
                text: text,
              },
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
