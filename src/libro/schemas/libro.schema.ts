import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type LibroDocument = Libro & Document;

@Schema({ timestamps: true })
export class Libro {
  @Prop({ required: true })
  titulo: string;

  @Prop({ type: Types.ObjectId, ref: 'Autor', required: true })
  autor: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Categoria', required: true })
  categoria: Types.ObjectId;

  @Prop()
  descripcion?: string;

  @Prop({ min: 0 })
  precio: number;

  @Prop({ unique: true })
  isbn?: string;

  @Prop()
  fechaPublicacion?: Date;

  @Prop()
  archivoURL?: string;

  @Prop()
  imagen?: string;

  @Prop()
  imagenThumbnail?: string;

}

export const LibroSchema = SchemaFactory.createForClass(Libro);

LibroSchema.index({ autor: 1 });
LibroSchema.index({ categoria: 1 });
LibroSchema.index({ isbn: 1 });
LibroSchema.index({ titulo: 'text', descripcion: 'text' });
