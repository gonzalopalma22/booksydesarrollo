import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';
import { Categoria, CategoriaDocument } from './schemas/categoria.schema';

@Injectable()
export class CategoriaService {
  constructor(
    @InjectModel(Categoria.name) private categoriaModel: Model<CategoriaDocument>,
  ) {}

  async create(createCategoriaDto: CreateCategoriaDto): Promise<Categoria> {
    const nuevoCategoria = await this.categoriaModel.create(createCategoriaDto);
    return nuevoCategoria;
  }

  async findAll(): Promise<Categoria[]> {
    const categorias = await this.categoriaModel.find();
    return categorias;
  }

  async findOne(id: string | number): Promise<Categoria> {
    const categoria = await this.categoriaModel.findById(id);
    if (!categoria) {
      throw new NotFoundException(`Categoria con ID ${id} no encontrado`);
    }
    return categoria;
  }

  async update(id: string | number, updateCategoriaDto: UpdateCategoriaDto): Promise<Categoria> {
    const categoria = await this.categoriaModel.findByIdAndUpdate(id, updateCategoriaDto, { new: true });
    if (!categoria) {
      throw new NotFoundException(`Categoria con ID ${id} no encontrado`);
    }
    return categoria;
  }

  async remove(id: string | number): Promise<void> {
    const result = await this.categoriaModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException(`Categoria con ID ${id} no encontrado`);
    }
  }
}
