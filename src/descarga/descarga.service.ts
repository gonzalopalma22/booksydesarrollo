import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateDescargaDto } from './dto/create-descarga.dto';
import { UpdateDescargaDto } from './dto/update-descarga.dto';
import { Descarga, DescargaDocument } from './schemas/descarga.schema';

@Injectable()
export class DescargaService {
  constructor(
    @InjectModel(Descarga.name) private descargaModel: Model<DescargaDocument>,
  ) {}

  async create(createDescargaDto: CreateDescargaDto): Promise<Descarga> {
    const nuevoDescarga = await this.descargaModel.create(createDescargaDto);
    return nuevoDescarga;
  }

  async findAll(): Promise<Descarga[]> {
    const descargas = await this.descargaModel.find();
    return descargas;
  }

  async findOne(id: string | number): Promise<Descarga> {
    const descarga = await this.descargaModel.findById(id)
    .populate('libro', 'titulo autor precio')
    .populate('cliente', 'nombre email');
    if (!descarga) {
      throw new NotFoundException(`Descarga con ID ${id} no encontrado`);
    }
    return descarga;
  }

  async update(id: string | number, updateDescargaDto: UpdateDescargaDto): Promise<Descarga> {
    const descarga = await this.descargaModel.findByIdAndUpdate(id, updateDescargaDto, { new: true })
    .populate('libro', 'titulo autor precio')
    .populate('cliente', 'nombre email');
    if (!descarga) {
      throw new NotFoundException(`Descarga con ID ${id} no encontrado`);
    }
    return descarga;
  }

  async remove(id: string | number): Promise<void> {
    const result = await this.descargaModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException(`Descarga con ID ${id} no encontrado`);
    }
  }
}
