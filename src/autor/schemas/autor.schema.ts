import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AutorDocument = Autor & Document;

@Schema({ timestamps: true })
export class Autor {
  @Prop({ required: true })
  nombre: string;

  @Prop()
  biografia?: string;

  @Prop()
  foto?: string;

  @Prop()
  imagen?: string;

  @Prop()
  imagenThumbnail?: string;

}

export const AutorSchema = SchemaFactory.createForClass(Autor);

AutorSchema.index({ nombre: 1 });
