import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AdminLoginDto } from './dto/admin-login.dto';

export type AdminRole = 'editor' | 'operator' | 'viewer';

export interface AdminJwtPayload {
  sub: string;
  role: AdminRole;
  username: string;
  iat: number;
  exp: number;
}

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  login(input: AdminLoginDto) {
    const editorUsername =
      process.env.ADMIN_EDITOR_USERNAME ??
      process.env.ADMIN_USERNAME ??
      'admin';
    const editorPassword =
      process.env.ADMIN_EDITOR_PASSWORD ??
      process.env.ADMIN_PASSWORD ??
      'change-me-please';
    const viewerUsername = process.env.ADMIN_VIEWER_USERNAME ?? 'viewer';
    const viewerPassword =
      process.env.ADMIN_VIEWER_PASSWORD ?? 'change-me-viewer';
    const operatorUsername = process.env.ADMIN_OPERATOR_USERNAME ?? 'operator';
    const operatorPassword =
      process.env.ADMIN_OPERATOR_PASSWORD ?? 'change-me-operator';

    const role = this.resolveRole(input, {
      editorUsername,
      editorPassword,
      operatorUsername,
      operatorPassword,
      viewerUsername,
      viewerPassword,
    });

    if (!role) {
      throw new UnauthorizedException(
        '아이디 또는 비밀번호가 올바르지 않습니다.',
      );
    }

    const expiresInSeconds = Number(
      process.env.JWT_EXPIRES_IN_SECONDS ?? 43200,
    );

    const token = this.jwtService.sign({
      sub: `admin:${role}:${input.username}`,
      role,
      username: input.username,
    });

    return {
      accessToken: token,
      tokenType: 'Bearer',
      role,
      username: input.username,
      expiresInSeconds: Number.isFinite(expiresInSeconds)
        ? expiresInSeconds
        : 43200,
    };
  }

  private resolveRole(
    input: AdminLoginDto,
    credentials: {
      editorUsername: string;
      editorPassword: string;
      operatorUsername: string;
      operatorPassword: string;
      viewerUsername: string;
      viewerPassword: string;
    },
  ): AdminRole | null {
    if (
      input.username === credentials.editorUsername &&
      input.password === credentials.editorPassword
    ) {
      return 'editor';
    }

    if (
      input.username === credentials.operatorUsername &&
      input.password === credentials.operatorPassword
    ) {
      return 'operator';
    }

    if (
      input.username === credentials.viewerUsername &&
      input.password === credentials.viewerPassword
    ) {
      return 'viewer';
    }

    return null;
  }

  verifyToken(token: string): AdminJwtPayload {
    return this.jwtService.verify<AdminJwtPayload>(token);
  }
}
