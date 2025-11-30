import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CategoriaService } from './categoria.service';
import { CategoriaController } from './categoria.controller';
import { UploadModule } from '../upload/upload.module';
import { Categoria, CategoriaSchema } from './schemas/categoria.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Categoria.name, schema: CategoriaSchema }]),
    UploadModule,
  ],
  controllers: [CategoriaController],
  providers: [CategoriaService],
  exports: [CategoriaService],
})
export class CategoriaModule {}
