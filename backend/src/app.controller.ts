import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AppService } from './app.service';
import { Public } from '@modules/auth/decorators/public.decorator';
import { Roles } from '@modules/auth/decorators/roles.decorator';
import { RolesGuard } from '@modules/auth/guards/roles.guard';
import { CurrentUser } from '@modules/auth/decorators/current-user.decorator';
import { Role } from '@common/enums/role.enum';
import { User } from '@prisma/generated/prisma';

@ApiTags('app')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Public endpoint - Health check' })
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('protected')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Protected endpoint - Requires authentication' })
  getProtected(@CurrentUser() user: User): object {
    return {
      message: 'This is a protected route',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Get('admin-only')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Admin only endpoint - Requires ADMIN role' })
  getAdminOnly(@CurrentUser() user: User): object {
    return {
      message: 'This is an admin-only route',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  }
}
