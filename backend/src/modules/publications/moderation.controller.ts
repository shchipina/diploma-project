import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { RolesGuard } from '@modules/auth/guards/roles.guard';
import { Roles } from '@modules/auth/decorators/roles.decorator';
import { Role } from '@common/enums/role.enum';
import { PublicationsService } from './publications.service';
import { QueryPublicationDto } from './dto/query-publication.dto';
import { ModerationQueryDto } from './dto/moderation-query.dto';

@ApiTags('moderation')
@ApiBearerAuth('JWT-auth')
@Controller('moderation')
@UseGuards(RolesGuard)
@Roles(Role.ADMIN)
export class ModerationController {
  constructor(private readonly publicationsService: PublicationsService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Статистика модерації' })
  getStats() {
    return this.publicationsService.getModerationStats();
  }

  @Get('publications')
  @ApiOperation({ summary: 'Всі публікації для модерації' })
  findAll(@Query() query: ModerationQueryDto) {
    return this.publicationsService.findAllForModeration(query);
  }

  @Get('publications/pending')
  @ApiOperation({ summary: 'Публікації на розгляді' })
  findPending(@Query() query: QueryPublicationDto) {
    return this.publicationsService.findPendingForModeration(query);
  }

  @Patch('publications/:id/approve')
  @ApiOperation({ summary: 'Схвалити публікацію' })
  approve(@Param('id', ParseUUIDPipe) id: string) {
    return this.publicationsService.moderatePublication(id, 'PUBLISHED');
  }

  @Patch('publications/:id/reject')
  @ApiOperation({ summary: 'Відхилити публікацію' })
  reject(@Param('id', ParseUUIDPipe) id: string) {
    return this.publicationsService.moderatePublication(id, 'REJECTED');
  }
}
