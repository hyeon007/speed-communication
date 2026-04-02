import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { AdminJwtPayload, AuthService } from './auth.service';

export type AdminRequest = Request & {
  admin?: AdminJwtPayload;
};

@Injectable()
export class AdminAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AdminRequest>();
    const header = request.headers.authorization;

    if (!header || !header.startsWith('Bearer ')) {
      throw new UnauthorizedException('관리자 인증 토큰이 필요합니다.');
    }

    const token = header.replace('Bearer ', '').trim();

    if (!token) {
      throw new UnauthorizedException('관리자 인증 토큰이 필요합니다.');
    }

    try {
      const decoded: AdminJwtPayload = this.authService.verifyToken(token);
      request['admin'] = decoded;
      return true;
    } catch {
      throw new UnauthorizedException('유효하지 않은 인증 토큰입니다.');
    }
  }
}
