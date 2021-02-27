import { Module } from '@nestjs/common';
import { GATEWAY_BUILD_SERVICE, GraphQLGatewayModule } from '@nestjs/graphql';
import { RemoteGraphQLDataSource } from '@apollo/gateway';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { GqlThrottlerGuard } from './guards/throttler.guard';

class AuthenticatedDataSource extends RemoteGraphQLDataSource {
  async willSendRequest({ request, context }) {
    if (context.Authorization) {
      request.http.headers.set('Authorization', context.Authorization);
    }
  }
}

@Module({
  providers: [
    {
      provide: AuthenticatedDataSource,
      useValue: AuthenticatedDataSource,
    },
    {
      provide: GATEWAY_BUILD_SERVICE,
      useFactory: AuthenticatedDataSource => {
        return ({ url }) => new AuthenticatedDataSource({ url });
      },
      inject: [AuthenticatedDataSource],
    },
  ],
  exports: [GATEWAY_BUILD_SERVICE],
})
class BuildServiceModule {}

@Module({
  imports: [
    ConfigModule.forRoot(),
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 500,
    }),
    GraphQLGatewayModule.forRootAsync({
      useFactory: async () => ({
        cors: {
          origin: 'http://localhost:3000',
          credentials: true,
        },
        gateway: {
          serviceList: [
            { name: 'users', url: process.env.USER_URL },
            { name: 'posts', url: process.env.BLOG_URL },
          ],
        },
        server: {
          context: ({ req }) => ({
            Authorization: req.headers.authorization || null,
          }),
        },
      }),
      imports: [BuildServiceModule],
      inject: [GATEWAY_BUILD_SERVICE],
    }),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: GqlThrottlerGuard,
    },
  ],
})
export class AppModule {}
