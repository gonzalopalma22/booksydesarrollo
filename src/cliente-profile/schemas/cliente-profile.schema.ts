import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../../auth/schemas/user.schema';

export type ClienteProfileDocument = ClienteProfile & Document;

/**
 * ClienteProfile - Profile de negocio para rol CLIENTE
 * Siguiendo el patrón DDD: User maneja auth, Profile maneja datos de negocio
 */
@Schema({ timestamps: true })
export class ClienteProfile {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  user: User | Types.ObjectId;

  @Prop({ required: true })
  nombre: string;

  @Prop()
  telefono?: string;

  @Prop()
  preferenciasLectura?: string;

  @Prop()
  biblioteca?: string;

  @Prop({ default: true })
  isActive: boolean;
}

export const ClienteProfileSchema = SchemaFactory.createForClass(ClienteProfile);

// Indexes para optimizar queries
ClienteProfileSchema.index({ user: 1 });
