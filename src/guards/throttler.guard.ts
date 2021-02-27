import { ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class GqlThrottlerGuard extends ThrottlerGuard {
  getRequestResponse(context: ExecutionContext) {
    const gql = GqlExecutionContext.create(context);
    const ctxGql = gql.getContext();
    const req = ctxGql.getContext().req;
    const ctx = ctxGql.req;

    return { req, ctx, res: ctx.res };
  }
}
