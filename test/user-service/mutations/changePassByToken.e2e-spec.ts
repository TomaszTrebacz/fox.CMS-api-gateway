import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../../src/app.module';

describe('changePassByToken [mutation](e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  const mutation =
    'mutation($input: ChangePassByTokenInput) { \
        changePassByToken(changePassByTokenInput: $input) \
      }';

  describe('if user provided valid token and too short password', () => {
    it('should throw the error', () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: mutation,
          variables: {
            input: {
              token:
                'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImUyN2Q2OTg3LTBjNjAtNDJiYS04ZGVlLTM2YTFiMDlkMDhmMSIsImlhdCI6MTYxNDM0MjkyMCwiZXhwIjoxNjQ1ODc4OTIwfQ.kmsD0GARoRoxHDzRhp2I4j5f_NsNPkhAvCmyFBAAZJk',
              password: 'sa',
            },
          },
        })
        .expect(200)
        .expect(res => {
          expect(res.body.errors[0].message).toEqual(
            'password must be longer than or equal to 8 characters',
          );
        });
    });
  });

  describe('if user provided valid token and too long password', () => {
    it('should throw the error', () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: mutation,
          variables: {
            input: {
              token:
                'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImUyN2Q2OTg3LTBjNjAtNDJiYS04ZGVlLTM2YTFiMDlkMDhmMSIsImlhdCI6MTYxNDM0MjkyMCwiZXhwIjoxNjQ1ODc4OTIwfQ.kmsD0GARoRoxHDzRhp2I4j5f_NsNPkhAvCmyFBAAZJk',
              password: `
                  toolongpasswordwhichhas129characterstoolongpasswordwhichhas129characters
                  toolongpasswordwhichhas129characterstoolongpasswordwhichhas129characters
                  `,
            },
          },
        })
        .expect(200)
        .expect(res => {
          expect(res.body.errors[0].message).toEqual(
            'password must be shorter than or equal to 128 characters',
          );
        });
    });
  });

  describe('if user provided valid token and valid password', () => {
    it('should successfully confirm user and return true', () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: mutation,
          variables: {
            input: {
              token:
                'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImUyN2Q2OTg3LTBjNjAtNDJiYS04ZGVlLTM2YTFiMDlkMDhmMSIsImlhdCI6MTYxNDM0MjkyMCwiZXhwIjoxNjQ1ODc4OTIwfQ.kmsD0GARoRoxHDzRhp2I4j5f_NsNPkhAvCmyFBAAZJk',
              password: 'asdddddddddd',
            },
          },
        })
        .expect(200)
        .expect(({ body }) => {
          expect(body.data.changePassByToken).toBeTruthy();
        });
    });
  });

  describe('if user provided invalid token', () => {
    it('should throw the error', () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: mutation,
          variables: {
            input: {
              token:
                'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjRmNGMxZDExLTgxNmYtNDZmYS04YThlLTU3NWVlMWNhMzk5OCIsImRhdGEiOiIrNDg0MjEzNDU3ODciLCJpYXQiOjE2MTQyODc5MTIsImV4cCI6MTYxNDI4ODIxMn0.UiIqaxQp-NQBGSe3FXYez6K3sDIEyxgFO2DM6Dxug4A',
              password: 'asdddddddddd',
            },
          },
        })
        .expect(200)
        .expect(res => {
          expect(res.body.errors[0].message).toEqual(
            'Can not change password: Unauthorized',
          );
        });
    });
  });
  describe('if user provided expired token', () => {
    it('should throw the error', () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: mutation,
          variables: {
            input: {
              token:
                'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY2ZGY0NjQzLTI1NTEtNGFlYS05MmNhLTZlNGQyZTBlM2RmNCIsImlhdCI6MTYxNDI4NTExMywiZXhwIjoxNjE0Mjg2OTEzfQ.hZ8mS_Ae_NRDatqCTyrYApIFIdxQApHoM1Kj_pXlgWk',
              password: 'asdddddddddd',
            },
          },
        })
        .expect(200)
        .expect(res => {
          expect(res.body.errors[0].message).toEqual(
            'Can not change password: Unauthorized',
          );
        });
    });
  });
});
