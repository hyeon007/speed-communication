import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { AdminRequest } from './admin-auth.guard';

@Injectable()
export class AdminBulkWriteGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AdminRequest>();

    if (request.admin?.role !== 'editor') {
      throw new ForbiddenException(
        '대량 변경은 편집 가능(editor) 계정에서만 수행할 수 있습니다.',
      );
    }

    return true;
  }
}
