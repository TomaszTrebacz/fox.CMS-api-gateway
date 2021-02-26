import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../../src/app.module';

describe('confirmUser [mutation](e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  const mutation =
    'mutation($token: String) { \
      confirmUser(confirmToken: $token) \
    }';

  describe('if user provided valid token', () => {
    it('should successfully confirm user and return true', () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: mutation,
          variables: {
            token:
              'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY0OTcyY2Y1LTFhNTItNDM5ZC04ODcxLTA3YWU1YzE4ZWJiNSIsImlhdCI6MTYxNDM0MTQ1NiwiZXhwIjoxNzAwNzQxNDU2fQ.BMVnCMeFI-PxbyB3zSkIoeM-rf2YXJhkYcRwITZcF7o',
          },
        })
        .expect(200)
        .expect(({ body }) => {
          expect(body.data.confirmUser).toBeTruthy();
        });
    });
  });
  describe('otherwise', () => {
    describe('if user provided invalid token', () => {
      it('should throw the error', () => {
        return request(app.getHttpServer())
          .post('/graphql')
          .send({
            query: mutation,
            variables: {
              token:
                'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjRmNGMxZDExLTgxNmYtNDZmYS04YThlLTU3NWVlMWNhMzk5OCIsImRhdGEiOiIrNDg0MjEzNDU3ODciLCJpYXQiOjE2MTQyODc5MTIsImV4cCI6MTYxNDI4ODIxMn0.UiIqaxQp-NQBGSe3FXYez6K3sDIEyxgFO2DM6Dxug4A',
            },
          })
          .expect(200)
          .expect(res => {
            expect(res.body.errors[0].message).toEqual(
              'Can not confirm user: Unauthorized',
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
              token:
                'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY2ZGY0NjQzLTI1NTEtNGFlYS05MmNhLTZlNGQyZTBlM2RmNCIsImlhdCI6MTYxNDI4NTExMywiZXhwIjoxNjE0Mjg2OTEzfQ.hZ8mS_Ae_NRDatqCTyrYApIFIdxQApHoM1Kj_pXlgWk',
            },
          })
          .expect(200)
          .expect(res => {
            expect(res.body.errors[0].message).toEqual(
              'Can not confirm user: Unauthorized',
            );
          });
      });
    });
  });
});
