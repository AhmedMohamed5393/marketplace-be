import { PageOptionsDto } from './pageOption.dto';
export interface PageMetaDtoParameters {
  itemsPerPage: number;
  pageOptionsDto: PageOptionsDto;
  total: number;
}
