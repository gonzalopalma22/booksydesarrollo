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
import { CategoriaService } from './categoria.service';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';
import { UploadService } from '../upload/upload.service';

@ApiTags('Categoria')
@ApiBearerAuth('JWT-auth')
@Controller('categoria')
export class CategoriaController {
  constructor(
    private readonly categoriaService: CategoriaService,
    private readonly uploadService: UploadService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear nuevo Categoria' })
  @ApiBody({ type: CreateCategoriaDto })
  @ApiResponse({ status: 201, description: 'Categoria creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async create(@Body() createCategoriaDto: CreateCategoriaDto) {
    const data = await this.categoriaService.create(createCategoriaDto);
    return {
      success: true,
      message: 'Categoria creado exitosamente',
      data,
    };
  }

  @Post(':id/upload-image')
  @ApiOperation({ summary: 'Subir imagen para Categoria' })
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'id', description: 'ID del Categoria' })
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
  @ApiResponse({ status: 404, description: 'Categoria no encontrado' })
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
    const updated = await this.categoriaService.update(id, {
      imagen: uploadResult.url,
      imagenThumbnail: uploadResult.thumbnailUrl,
    });
    return {
      success: true,
      message: 'Imagen subida y asociada exitosamente',
      data: { categoria: updated, upload: uploadResult },
    };
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los Categorias' })
  @ApiResponse({ status: 200, description: 'Lista de Categorias' })
  async findAll() {
    const data = await this.categoriaService.findAll();
    return { success: true, data, total: data.length };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener Categoria por ID' })
  @ApiParam({ name: 'id', description: 'ID del Categoria' })
  @ApiResponse({ status: 200, description: 'Categoria encontrado' })
  @ApiResponse({ status: 404, description: 'Categoria no encontrado' })
  async findOne(@Param('id') id: string) {
    const data = await this.categoriaService.findOne(id);
    return { success: true, data };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar Categoria' })
  @ApiParam({ name: 'id', description: 'ID del Categoria' })
  @ApiBody({ type: UpdateCategoriaDto })
  @ApiResponse({ status: 200, description: 'Categoria actualizado exitosamente' })
  @ApiResponse({ status: 404, description: 'Categoria no encontrado' })
  async update(
    @Param('id') id: string, 
    @Body() updateCategoriaDto: UpdateCategoriaDto
  ) {
    const data = await this.categoriaService.update(id, updateCategoriaDto);
    return {
      success: true,
      message: 'Categoria actualizado exitosamente',
      data,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Eliminar Categoria' })
  @ApiParam({ name: 'id', description: 'ID del Categoria' })
  @ApiResponse({ status: 200, description: 'Categoria eliminado exitosamente' })
  @ApiResponse({ status: 404, description: 'Categoria no encontrado' })
  async remove(@Param('id') id: string) {
    const categoria = await this.categoriaService.findOne(id);
    if (categoria.imagen) {
      const filename = categoria.imagen.split('/').pop();
      if (filename) {
      await this.uploadService.deleteImage(filename);
      }
    }
    await this.categoriaService.remove(id);
    return { success: true, message: 'Categoria eliminado exitosamente' };
  }
}
