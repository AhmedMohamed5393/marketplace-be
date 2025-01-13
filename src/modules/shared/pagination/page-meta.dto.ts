import { ApiProperty } from '@nestjs/swagger';
import { PageMetaDtoParameters } from './pageDto.interface';
export class PageMetaDto {
  @ApiProperty()
  readonly page: number;
  @ApiProperty()
  readonly take: number;
  @ApiProperty()
  readonly itemsPerPage: number;
  @ApiProperty()
  readonly total: number;
  @ApiProperty()
  readonly pageCount: number;
  @ApiProperty()
  readonly hasPreviousPage: boolean;
  @ApiProperty()
  readonly hasNextPage: boolean;
  constructor({ pageOptionsDto, total, itemsPerPage }: PageMetaDtoParameters) {
    this.page = pageOptionsDto.page;
    this.take = pageOptionsDto.take;
    this.itemsPerPage = itemsPerPage;
    this.total = total;
    this.pageCount = Math.ceil(this.total / this.take);
    this.hasPreviousPage = this.page > 1;
    this.hasNextPage = this.page < this.pageCount;
  }
}
