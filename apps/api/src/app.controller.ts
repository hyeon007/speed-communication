import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('System')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @ApiOperation({ summary: 'Container liveness/readiness endpoint' })
  @ApiOkResponse({
    description:
      'Simple health response for load balancer and container probes',
    schema: { type: 'string', example: 'ok' },
  })
  @Get('healthz')
  healthz(): string {
    return 'ok';
  }

  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiOkResponse({
    description: 'Service heartbeat string',
    schema: { type: 'string', example: 'Hello World!' },
  })
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
