import { PartialType } from '@nestjs/swagger';
import { CreateDescargaDto } from './create-descarga.dto';

export class UpdateDescargaDto extends PartialType(CreateDescargaDto) {}
