import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiBody, ApiConsumes } from '@nestjs/swagger';
import { DescargaService } from './descarga.service';
import { CreateDescargaDto } from './dto/create-descarga.dto';
import { UpdateDescargaDto } from './dto/update-descarga.dto';
import { UploadService } from '../upload/upload.service';

@ApiTags('Descarga')
@ApiBearerAuth('JWT-auth')
@Controller('descarga')
export class DescargaController {
  constructor(
    private readonly descargaService: DescargaService,
    private readonly uploadService: UploadService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear nuevo Descarga' })
  @ApiBody({ type: CreateDescargaDto })
  @ApiResponse({ status: 201, description: 'Descarga creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async create(@Body() createDescargaDto: CreateDescargaDto) {
    const data = await this.descargaService.create(createDescargaDto);
    return {
      success: true,
      message: 'Descarga creado exitosamente',
      data,
    };
  }

  @Post(':id/upload-image')
  @ApiOperation({ summary: 'Subir imagen para Descarga' })
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'id', description: 'ID del Descarga' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Imagen subida exitosamente' })
  @ApiResponse({ status: 404, description: 'Descarga no encontrado' })
  async uploadImage(
    @Param('id') id: string,
    @Req() request: FastifyRequest,
  ) {
    // Obtener archivo de Fastify
    const data = await request.file();

    if (!data) {
      throw new BadRequestException('No se proporcionó ningún archivo');
    }

    if (!data.mimetype.startsWith('image/')) {
      throw new BadRequestException('El archivo debe ser una imagen');
    }

    const buffer = await data.toBuffer();
    const file = {
      buffer,
      originalname: data.filename,
      mimetype: data.mimetype,
    } as Express.Multer.File;

    const uploadResult = await this.uploadService.uploadImage(file);
    const updated = await this.descargaService.update(id, {
      imagen: uploadResult.url,
      imagenThumbnail: uploadResult.thumbnailUrl,
    });
    return {
      success: true,
      message: 'Imagen subida y asociada exitosamente',
      data: { descarga: updated, upload: uploadResult },
    };
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los Descargas' })
  @ApiResponse({ status: 200, description: 'Lista de Descargas' })
  async findAll() {
    const data = await this.descargaService.findAll();
    return { success: true, data, total: data.length };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener Descarga por ID' })
  @ApiParam({ name: 'id', description: 'ID del Descarga' })
  @ApiResponse({ status: 200, description: 'Descarga encontrado' })
  @ApiResponse({ status: 404, description: 'Descarga no encontrado' })
  async findOne(@Param('id') id: string) {
    const data = await this.descargaService.findOne(id);
    return { success: true, data };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar Descarga' })
  @ApiParam({ name: 'id', description: 'ID del Descarga' })
  @ApiBody({ type: UpdateDescargaDto })
  @ApiResponse({ status: 200, description: 'Descarga actualizado exitosamente' })
  @ApiResponse({ status: 404, description: 'Descarga no encontrado' })
  async update(
    @Param('id') id: string, 
    @Body() updateDescargaDto: UpdateDescargaDto
  ) {
    const data = await this.descargaService.update(id, updateDescargaDto);
    return {
      success: true,
      message: 'Descarga actualizado exitosamente',
      data,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Eliminar Descarga' })
  @ApiParam({ name: 'id', description: 'ID del Descarga' })
  @ApiResponse({ status: 200, description: 'Descarga eliminado exitosamente' })
  @ApiResponse({ status: 404, description: 'Descarga no encontrado' })
  async remove(@Param('id') id: string) {
    const descarga = await this.descargaService.findOne(id);
    if (descarga.imagen) {
      const filename = descarga.imagen.split('/').pop();
      if (filename) {
      await this.uploadService.deleteImage(filename);
      }
    }
    await this.descargaService.remove(id);
    return { success: true, message: 'Descarga eliminado exitosamente' };
  }
}
