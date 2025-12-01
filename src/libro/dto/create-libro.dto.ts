import { IsString, IsNotEmpty, IsOptional, IsNumber, IsMongoId, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateLibroDto {
  @ApiProperty({ description: 'Título del libro' })
  @IsString()
  @IsNotEmpty()
  titulo: string;

  @ApiProperty({ description: 'ID del Autor (Debe ser un ObjectId válido)' })
  @IsMongoId()
  @IsNotEmpty()
  autor: string; 

  @ApiProperty({ description: 'ID de la Categoría (Debe ser un ObjectId válido)' })
  @IsMongoId()
  @IsNotEmpty()
  categoria: string; 

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  descripcion?: string;

  @ApiProperty({ required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  precio?: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  imagen?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  imagenThumbnail?: string;
}
