import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseInterceptors,
  UploadedFile,
  ParseUUIDPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiConsumes,
  ApiBearerAuth,
  ApiOperation,
  ApiBody,
} from '@nestjs/swagger';
import { CurrentUser } from '@modules/auth/decorators/current-user.decorator';
import { Public } from '@modules/auth/decorators/public.decorator';
import { User } from '@prisma/generated/prisma';
import { PublicationsService } from './publications.service';
import { CreatePublicationDto } from './dto/create-publication.dto';
import { UpdatePublicationDto } from './dto/update-publication.dto';
import { QueryPublicationDto } from './dto/query-publication.dto';

@ApiTags('publications')
@ApiBearerAuth('JWT-auth')
@Controller('publications')
export class PublicationsController {
  constructor(private readonly publicationsService: PublicationsService) {}

  @Post()
  @ApiOperation({ summary: 'Створити нову публікацію' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        description: { type: 'string' },
        tags: { type: 'array', items: { type: 'string' } },
        image: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(FileInterceptor('image'))
  create(
    @CurrentUser() user: User,
    @Body() dto: CreatePublicationDto,
    @UploadedFile() image?: Express.Multer.File,
  ) {
    return this.publicationsService.create(user.id, dto, image);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Оновити публікацію' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('image'))
  update(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePublicationDto,
    @UploadedFile() image?: Express.Multer.File,
  ) {
    return this.publicationsService.update(user.id, id, dto, image);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Видалити публікацію' })
  delete(@CurrentUser() user: User, @Param('id', ParseUUIDPipe) id: string) {
    return this.publicationsService.delete(user.id, id);
  }

  @Get('my')
  @ApiOperation({ summary: 'Мої публікації' })
  findMy(@CurrentUser() user: User, @Query() query: QueryPublicationDto) {
    return this.publicationsService.findMyPublications(user.id, query);
  }

  @Get('feed')
  @Public()
  @ApiOperation({ summary: 'Стрічка опублікованих публікацій' })
  findPublished(@Query() query: QueryPublicationDto) {
    return this.publicationsService.findPublished(query);
  }

  @Get('popular')
  @Public()
  @ApiOperation({ summary: 'Популярні публікації' })
  findPopular(@Query() query: QueryPublicationDto) {
    return this.publicationsService.findPopular(query);
  }

  @Get('for-you')
  @ApiOperation({ summary: 'Публікації за вашими інтересами' })
  findForYou(@CurrentUser() user: User, @Query() query: QueryPublicationDto) {
    return this.publicationsService.findForYou(user.id, query);
  }

  @Get('saved')
  @ApiOperation({ summary: 'Збережені публікації' })
  findSaved(@CurrentUser() user: User, @Query() query: QueryPublicationDto) {
    return this.publicationsService.findSaved(user.id, query);
  }

  @Get('saved/ids')
  @ApiOperation({ summary: 'ID збережених публікацій' })
  findSavedIds(@CurrentUser() user: User) {
    return this.publicationsService.findSavedIds(user.id);
  }

  @Post(':id/save')
  @ApiOperation({ summary: 'Зберегти/видалити зі збережених' })
  toggleSave(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.publicationsService.toggleSave(user.id, id);
  }

  @Get('tags')
  @Public()
  @ApiOperation({ summary: 'Всі теги' })
  getAllTags() {
    return this.publicationsService.getAllTags();
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Отримати публікацію за ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user?: User) {
    return this.publicationsService.findOne(id, user?.id);
  }
}
