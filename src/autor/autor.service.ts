import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateAutorDto } from './dto/create-autor.dto';
import { UpdateAutorDto } from './dto/update-autor.dto';
import { Autor, AutorDocument } from './schemas/autor.schema';

@Injectable()
export class AutorService {
  constructor(
    @InjectModel(Autor.name) private autorModel: Model<AutorDocument>,
  ) {}

  async create(createAutorDto: CreateAutorDto): Promise<Autor> {
    const nuevoAutor = await this.autorModel.create(createAutorDto);
    return nuevoAutor;
  }

  async findAll(): Promise<Autor[]> {
    const autors = await this.autorModel.find();
    return autors;
  }

  async findOne(id: string | number): Promise<Autor> {
    const autor = await this.autorModel.findById(id);
    if (!autor) {
      throw new NotFoundException(`Autor con ID ${id} no encontrado`);
    }
    return autor;
  }

  async update(id: string | number, updateAutorDto: UpdateAutorDto): Promise<Autor> {
    const autor = await this.autorModel.findByIdAndUpdate(id, updateAutorDto, { new: true });
    if (!autor) {
      throw new NotFoundException(`Autor con ID ${id} no encontrado`);
    }
    return autor;
  }

  async remove(id: string | number): Promise<void> {
    const result = await this.autorModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException(`Autor con ID ${id} no encontrado`);
    }
  }
}
