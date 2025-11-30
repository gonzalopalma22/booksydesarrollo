import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LibroService } from './libro.service';
import { LibroController } from './libro.controller';
import { UploadModule } from '../upload/upload.module';
import { Libro, LibroSchema } from './schemas/libro.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Libro.name, schema: LibroSchema }]),
    UploadModule,
  ],
  controllers: [LibroController],
  providers: [LibroService],
  exports: [LibroService],
})
export class LibroModule {}
