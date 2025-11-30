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
import { LibroService } from './libro.service';
import { CreateLibroDto } from './dto/create-libro.dto';
import { UpdateLibroDto } from './dto/update-libro.dto';
import { UploadService } from '../upload/upload.service';

@ApiTags('Libro')
@ApiBearerAuth('JWT-auth')
@Controller('libro')
export class LibroController {
  constructor(
    private readonly libroService: LibroService,
    private readonly uploadService: UploadService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear nuevo Libro' })
  @ApiBody({ type: CreateLibroDto })
  @ApiResponse({ status: 201, description: 'Libro creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async create(@Body() createLibroDto: CreateLibroDto) {
    const data = await this.libroService.create(createLibroDto);
    return {
      success: true,
      message: 'Libro creado exitosamente',
      data,
    };
  }

  @Post(':id/upload-image')
  @ApiOperation({ summary: 'Subir imagen para Libro' })
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'id', description: 'ID del Libro' })
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
  @ApiResponse({ status: 404, description: 'Libro no encontrado' })
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
    const updated = await this.libroService.update(id, {
      imagen: uploadResult.url,
      imagenThumbnail: uploadResult.thumbnailUrl,
    });
    return {
      success: true,
      message: 'Imagen subida y asociada exitosamente',
      data: { libro: updated, upload: uploadResult },
    };
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los Libros' })
  @ApiResponse({ status: 200, description: 'Lista de Libros' })
  async findAll() {
    const data = await this.libroService.findAll();
    return { success: true, data, total: data.length };
  }

  @Get('categoria/:categoriaId')
  @ApiOperation({ summary: 'Buscar libros por categoría' })
  @ApiParam({ name: 'categoriaId', description: 'ID de la categoría' })
  @ApiResponse({ status: 200, description: 'Lista de libros por categoría' })
  async findByCategoria(@Param('categoriaId') categoriaId: string) {
    const data = await this.libroService.findByCategoria(categoriaId);
    return { success: true, data, total: data.length };
  }

  @Get('autor/:autorId')
  @ApiOperation({ summary: 'Buscar libros por autor' })
  @ApiParam({ name: 'autorId', description: 'ID del autor' })
  @ApiResponse({ status: 200, description: 'Lista de libros del autor' })
  async findByAutor(@Param('autorId') autorId: string) {
    const data = await this.libroService.findByAutor(autorId);
    return { success: true, data, total: data.length };
  }

  @Get('search/:termino')
  @ApiOperation({ summary: 'Buscar libros por término' })
  @ApiParam({ name: 'termino', description: 'Término de búsqueda' })
  @ApiResponse({ status: 200, description: 'Resultados de la búsqueda' })
  async buscarLibros(@Param('termino') termino: string) {
    const data = await this.libroService.buscarLibros(termino);
    return { success: true, data, total: data.length };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener Libro por ID' })
  @ApiParam({ name: 'id', description: 'ID del Libro' })
  @ApiResponse({ status: 200, description: 'Libro encontrado' })
  @ApiResponse({ status: 404, description: 'Libro no encontrado' })
  async findOne(@Param('id') id: string) {
    const data = await this.libroService.findOne(id);
    return { success: true, data };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar Libro' })
  @ApiParam({ name: 'id', description: 'ID del Libro' })
  @ApiBody({ type: UpdateLibroDto })
  @ApiResponse({ status: 200, description: 'Libro actualizado exitosamente' })
  @ApiResponse({ status: 404, description: 'Libro no encontrado' })
  async update(
    @Param('id') id: string, 
    @Body() updateLibroDto: UpdateLibroDto
  ) {
    const data = await this.libroService.update(id, updateLibroDto);
    return {
      success: true,
      message: 'Libro actualizado exitosamente',
      data,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Eliminar Libro' })
  @ApiParam({ name: 'id', description: 'ID del Libro' })
  @ApiResponse({ status: 200, description: 'Libro eliminado exitosamente' })
  @ApiResponse({ status: 404, description: 'Libro no encontrado' })
  async remove(@Param('id') id: string) {
    const libro = await this.libroService.findOne(id);
    if (libro.imagen) {
      const filename = libro.imagen.split('/').pop();
      if (filename) {
      await this.uploadService.deleteImage(filename);
      }
    }
    await this.libroService.remove(id);
    return { success: true, message: 'Libro eliminado exitosamente' };
  }
}
