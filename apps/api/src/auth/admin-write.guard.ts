import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { AdminRequest } from './admin-auth.guard';

@Injectable()
export class AdminWriteGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AdminRequest>();

    if (request.admin?.role === 'viewer') {
      throw new ForbiddenException(
        '읽기 전용 계정은 수정 작업을 수행할 수 없습니다.',
      );
    }

    return true;
  }
}
