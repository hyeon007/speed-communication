import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AdminAuthGuard } from '../auth/admin-auth.guard';
import { AdminWriteGuard } from '../auth/admin-write.guard';
import { AdminWriteRateLimitGuard } from '../auth/rate-limit.guard';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';
import { DevicesService } from './devices.service';

@ApiTags('Devices')
@Controller('api/v1')
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @ApiOperation({ summary: 'List published devices for the public catalog' })
  @ApiOkResponse({ description: 'Published device catalog' })
  @Get('devices')
  findPublic() {
    return this.devicesService.findPublic();
  }

  @ApiOperation({ summary: 'Get a published device detail by slug' })
  @ApiOkResponse({ description: 'Published device detail' })
  @Get('devices/:slug')
  findPublicBySlug(@Param('slug') slug: string) {
    return this.devicesService.findPublicBySlug(slug);
  }

  @ApiOperation({ summary: 'List all device records for the admin catalog' })
  @ApiBearerAuth('admin-bearer')
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  @UseGuards(AdminAuthGuard)
  @Get('admin/devices')
  findAll() {
    return this.devicesService.findAll();
  }

  @ApiOperation({
    summary: 'Create a device record without price or subsidy data',
  })
  @ApiBearerAuth('admin-bearer')
  @ApiCreatedResponse({ description: 'Device created' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  @ApiForbiddenResponse({ description: 'Viewer role cannot create devices' })
  @UseGuards(AdminAuthGuard, AdminWriteRateLimitGuard, AdminWriteGuard)
  @Post('admin/devices')
  create(@Body() body: CreateDeviceDto) {
    return this.devicesService.create(body);
  }

  @ApiOperation({ summary: 'Update a device record or publication status' })
  @ApiBearerAuth('admin-bearer')
  @ApiOkResponse({ description: 'Device updated' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  @ApiForbiddenResponse({ description: 'Viewer role cannot update devices' })
  @UseGuards(AdminAuthGuard, AdminWriteRateLimitGuard, AdminWriteGuard)
  @Patch('admin/devices/:slug')
  update(@Param('slug') slug: string, @Body() body: UpdateDeviceDto) {
    return this.devicesService.update(slug, body);
  }
}
