import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../../src/app.module';
import { adminToken, rootToken } from 'test/utils';

describe('updateUser [mutation](e2e)', () => {
  let app: INestApplication;
  var rootJWT: string;
  var adminJWT: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    rootJWT = await rootToken(request, app);
    adminJWT = await adminToken(request, app);
  });

  const mutation =
    'mutation($input: ChangeRoleInput) { \
        changeRole(changeRoleInput: $input) \
      }';

  describe('if user provided valid data and is logged as root', () => {
    it('should successfully change role and return true', () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${rootJWT}`)
        .send({
          query: mutation,
          variables: {
            input: {
              id: '8055d923-0cfd-40e9-879e-638e8ffc7475',
              role: 'user',
            },
          },
        })
        .expect(200)
        .expect(({ body }) => {
          expect(body.data.changeRole).toBeTruthy();
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
                id: '3d248dbc-4475-46e1-8361-6273d0f1fa9c',
                role: 'user',
              },
            },
          })
          .expect(200)
          .expect(res => {
            expect(res.body.errors[0].message).toEqual('No auth token');
          });
      });
    });
    describe('if user is not logged as root', () => {
      it('should throw the error', () => {
        return request(app.getHttpServer())
          .post('/graphql')
          .set('Authorization', `Bearer ${adminJWT}`)
          .send({
            query: mutation,
            variables: {
              input: {
                id: '8055d923-0cfd-40e9-879e-638e8ffc7475',
                role: 'user',
              },
            },
          })
          .expect(200)
          .expect(res => {
            expect(res.body.errors[0].message).toEqual('Wrong role!');
          });
      });
    });
    describe('if user provided role which does not exist', () => {
      it('should throw the error', () => {
        return request(app.getHttpServer())
          .post('/graphql')
          .set('Authorization', `Bearer ${rootJWT}`)
          .send({
            query: mutation,
            variables: {
              input: {
                id: '5de9c17b-cfa3-43bf-911b-d0808eab4664',
                role: 'role which does not exist',
              },
            },
          })
          .expect(200)
          .expect(res => {
            expect(res.body.errors[0].message).toEqual(
              'role must be a valid enum value',
            );
          });
      });
    });
  });
});
