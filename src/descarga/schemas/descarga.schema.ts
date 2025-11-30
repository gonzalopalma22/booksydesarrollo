import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type DescargaDocument = Descarga & Document;

@Schema({ timestamps: true })
export class Descarga {
  @Prop({ type: Types.ObjectId, ref: 'Libro', required: true })
  libro: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Cliente', required: true })
  cliente: Types.ObjectId;

  @Prop({ default: Date.now })
  fechaDescarga?: Date;

  @Prop({ enum: ['pdf', 'epub', 'mobi'], default: 'pdf' })
  formato?: string;

  @Prop()
  imagen?: string;

  @Prop()
  imagenThumbnail?: string;

}

export const DescargaSchema = SchemaFactory.createForClass(Descarga);

DescargaSchema.index({ libro: 1 });
DescargaSchema.index({ cliente: 1 });
DescargaSchema.index({ fechaDescarga: -1 });
