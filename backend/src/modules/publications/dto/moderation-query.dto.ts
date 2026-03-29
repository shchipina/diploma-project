import { IsOptional, IsString, IsIn } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { QueryPublicationDto } from './query-publication.dto';

export class ModerationQueryDto extends QueryPublicationDto {
  @ApiPropertyOptional({
    description: 'Фільтр за статусом',
    enum: ['PENDING', 'PUBLISHED', 'REJECTED', 'ALL'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['PENDING', 'PUBLISHED', 'REJECTED', 'ALL'])
  status?: string;
}
