import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AutorService } from './autor.service';
import { AutorController } from './autor.controller';
import { UploadModule } from '../upload/upload.module';
import { Autor, AutorSchema } from './schemas/autor.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Autor.name, schema: AutorSchema }]),
    UploadModule,
  ],
  controllers: [AutorController],
  providers: [AutorService],
  exports: [AutorService],
})
export class AutorModule {}
