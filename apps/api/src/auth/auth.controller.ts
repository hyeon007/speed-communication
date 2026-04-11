import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AdminAuthGuard } from './admin-auth.guard';
import type { AdminRequest } from './admin-auth.guard';
import { AuthService } from './auth.service';
import { AdminLoginDto } from './dto/admin-login.dto';
import { AdminLoginRateLimitGuard } from './rate-limit.guard';

@ApiTags('Admin Auth')
@Controller('api/v1/admin/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Admin login (editor/operator/viewer)' })
  @ApiBody({ type: AdminLoginDto })
  @ApiCreatedResponse({
    description: 'JWT login success payload',
    schema: {
      type: 'object',
      properties: {
        accessToken: { type: 'string' },
        tokenType: { type: 'string', example: 'Bearer' },
        role: { type: 'string', enum: ['editor', 'operator', 'viewer'] },
        username: { type: 'string' },
        expiresInSeconds: { type: 'number', example: 43200 },
      },
      required: [
        'accessToken',
        'tokenType',
        'role',
        'username',
        'expiresInSeconds',
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Invalid username/password' })
  @UseGuards(AdminLoginRateLimitGuard)
  @Post('login')
  login(@Body() body: AdminLoginDto) {
    return this.authService.login(body);
  }

  @ApiOperation({ summary: 'Get currently authenticated admin profile' })
  @ApiBearerAuth('admin-bearer')
  @ApiOkResponse({
    description: 'Current authenticated admin metadata',
    schema: {
      type: 'object',
      properties: {
        username: { type: 'string', nullable: true },
        role: {
          type: 'string',
          nullable: true,
          enum: ['editor', 'operator', 'viewer'],
        },
      },
      required: ['username', 'role'],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  @UseGuards(AdminAuthGuard)
  @Get('me')
  me(@Req() request: AdminRequest) {
    return {
      username: request.admin?.username ?? null,
      role: request.admin?.role ?? null,
    };
  }
}
