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
import { AutorService } from './autor.service';
import { CreateAutorDto } from './dto/create-autor.dto';
import { UpdateAutorDto } from './dto/update-autor.dto';
import { UploadService } from '../upload/upload.service';

@ApiTags('Autor')
@ApiBearerAuth('JWT-auth')
@Controller('autor')
export class AutorController {
  constructor(
    private readonly autorService: AutorService,
    private readonly uploadService: UploadService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear nuevo Autor' })
  @ApiBody({ type: CreateAutorDto })
  @ApiResponse({ status: 201, description: 'Autor creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async create(@Body() createAutorDto: CreateAutorDto) {
    const data = await this.autorService.create(createAutorDto);
    return {
      success: true,
      message: 'Autor creado exitosamente',
      data,
    };
  }

  @Post(':id/upload-image')
  @ApiOperation({ summary: 'Subir imagen para Autor' })
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'id', description: 'ID del Autor' })
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
  @ApiResponse({ status: 404, description: 'Autor no encontrado' })
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
    const updated = await this.autorService.update(id, {
      imagen: uploadResult.url,
      imagenThumbnail: uploadResult.thumbnailUrl,
    });
    return {
      success: true,
      message: 'Imagen subida y asociada exitosamente',
      data: { autor: updated, upload: uploadResult },
    };
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los Autors' })
  @ApiResponse({ status: 200, description: 'Lista de Autors' })
  async findAll() {
    const data = await this.autorService.findAll();
    return { success: true, data, total: data.length };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener Autor por ID' })
  @ApiParam({ name: 'id', description: 'ID del Autor' })
  @ApiResponse({ status: 200, description: 'Autor encontrado' })
  @ApiResponse({ status: 404, description: 'Autor no encontrado' })
  async findOne(@Param('id') id: string) {
    const data = await this.autorService.findOne(id);
    return { success: true, data };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar Autor' })
  @ApiParam({ name: 'id', description: 'ID del Autor' })
  @ApiBody({ type: UpdateAutorDto })
  @ApiResponse({ status: 200, description: 'Autor actualizado exitosamente' })
  @ApiResponse({ status: 404, description: 'Autor no encontrado' })
  async update(
    @Param('id') id: string, 
    @Body() updateAutorDto: UpdateAutorDto
  ) {
    const data = await this.autorService.update(id, updateAutorDto);
    return {
      success: true,
      message: 'Autor actualizado exitosamente',
      data,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Eliminar Autor' })
  @ApiParam({ name: 'id', description: 'ID del Autor' })
  @ApiResponse({ status: 200, description: 'Autor eliminado exitosamente' })
  @ApiResponse({ status: 404, description: 'Autor no encontrado' })
  async remove(@Param('id') id: string) {
    const autor = await this.autorService.findOne(id);
    if (autor.imagen) {
      const filename = autor.imagen.split('/').pop();
      if (filename) {
      await this.uploadService.deleteImage(filename);
      }
    }
    await this.autorService.remove(id);
    return { success: true, message: 'Autor eliminado exitosamente' };
  }
}
