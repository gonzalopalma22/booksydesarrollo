import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DescargaService } from './descarga.service';
import { DescargaController } from './descarga.controller';
import { UploadModule } from '../upload/upload.module';
import { Descarga, DescargaSchema } from './schemas/descarga.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Descarga.name, schema: DescargaSchema }]),
    UploadModule,
  ],
  controllers: [DescargaController],
  providers: [DescargaService],
  exports: [DescargaService],
})
export class DescargaModule {}
