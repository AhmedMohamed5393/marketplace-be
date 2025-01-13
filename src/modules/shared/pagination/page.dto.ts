import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';
import { PageMetaDto } from './page-meta.dto';
export class PageDto<T> {
  @IsArray()
  @ApiProperty({ isArray: true })
  readonly data: T[] | any;

  @IsString()
  @ApiProperty({ type: String })
  readonly message: T[] | any;

  @ApiProperty({ type: () => PageMetaDto })
  readonly meta: PageMetaDto;
  constructor(message: string, data: T[] | any, meta: PageMetaDto) {
    this.message = message;
    this.meta = meta;
    this.data = data;
  }
}
