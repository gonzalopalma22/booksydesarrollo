import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateLibroDto } from './dto/create-libro.dto';
import { UpdateLibroDto } from './dto/update-libro.dto';
import { Libro, LibroDocument } from './schemas/libro.schema';

@Injectable()
export class LibroService {
  constructor(
    @InjectModel(Libro.name) private libroModel: Model<LibroDocument>,
  ) {}

  async create(createLibroDto: CreateLibroDto): Promise<Libro> {
    const nuevoLibro = await this.libroModel.create(createLibroDto);
    return nuevoLibro;
  }

  async findAll(): Promise<Libro[]> {
    const libros = await this.libroModel.find().populate('autor', 'nombre biografia');
    return libros;
  }

  async findOne(id: string | number): Promise<Libro> {
    const libro = await this.libroModel.findById(id)
      .populate('autor', 'nombre biografia')
      .populate('categoria', 'nombre descripcion');
    if (!libro) {
      throw new NotFoundException(`Libro con ID ${id} no encontrado`);
    }
    return libro;
  }

  async update(id: string | number, updateLibroDto: UpdateLibroDto): Promise<Libro> {
    const libro = await this.libroModel.findByIdAndUpdate(id, updateLibroDto, { new: true }).populate('autor', 'nombre biografia')
    .populate('categoria', 'nombre descripcion');
    if (!libro) {
      throw new NotFoundException(`Libro con ID ${id} no encontrado`);
    }
    return libro;
  }

  async remove(id: string | number): Promise<void> {
    const result = await this.libroModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException(`Libro con ID ${id} no encontrado`);
    }
  }

  async findByCategoria(categoriaId: string): Promise<Libro[]> {
    const libros = await this.libroModel
      .find({ categoria: new Types.ObjectId(categoriaId) })
      .populate('autor', 'nombre biografia')
      .populate('categoria', 'nombre descripcion')
      .sort({ titulo: 1 });
    return libros;
  }

  async findByAutor(autorId: string): Promise<Libro[]> {
    const libros = await this.libroModel
      .find({ autor: new Types.ObjectId(autorId) })
      .populate('autor', 'nombre biografia')
      .populate('categoria', 'nombre descripcion')
      .sort({ titulo: 1 });
    return libros;
  }

  async buscarLibros(termino: string): Promise<Libro[]> {
    const libros = await this.libroModel
      .find({
        $or: [
          { titulo: { $regex: termino, $options: 'i' } },
          { descripcion: { $regex: termino, $options: 'i' } },
          { isbn: { $regex: termino, $options: 'i' } }
        ]
      })
      .populate('autor', 'nombre biografia')
      .populate('categoria', 'nombre descripcion')
      .sort({ titulo: 1 });
    return libros;
  }
}
