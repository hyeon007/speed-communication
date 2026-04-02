import {
  CallHandler,
  ExecutionContext,
  HttpException,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

type AdminIdentity = {
  username?: string;
  role?: string;
};

type RequestWithAdmin = Request & {
  admin?: AdminIdentity;
};

@Injectable()
export class AdminRequestAuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AdminRequestAuditInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest<RequestWithAdmin>();
    const response = context.switchToHttp().getResponse<Response>();
    const startedAt = Date.now();

    return next.handle().pipe(
      tap(() => {
        this.logger.log(
          this.formatLogMessage({
            request,
            statusCode: response.statusCode,
            durationMs: Date.now() - startedAt,
          }),
        );
      }),
      catchError((error: unknown) => {
        const statusCode =
          error instanceof HttpException ? error.getStatus() : 500;

        this.logger.warn(
          this.formatLogMessage({
            request,
            statusCode,
            durationMs: Date.now() - startedAt,
          }),
        );

        return throwError(() => error);
      }),
    );
  }

  private formatLogMessage(input: {
    request: RequestWithAdmin;
    statusCode: number;
    durationMs: number;
  }): string {
    const { request, statusCode, durationMs } = input;
    const admin = request.admin;
    const requester = admin?.username ?? 'anonymous';
    const role = admin?.role ?? '-';

    return [
      `method=${request.method}`,
      `path=${request.originalUrl || request.url}`,
      `status=${statusCode}`,
      `requester=${requester}`,
      `role=${role}`,
      `durationMs=${durationMs}`,
    ].join(' ');
  }
}
