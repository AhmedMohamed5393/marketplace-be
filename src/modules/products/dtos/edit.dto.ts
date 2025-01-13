import { PartialType } from '@nestjs/mapped-types';
import { AddDto } from './add.dto';

export class EditDto extends PartialType(AddDto) {}
