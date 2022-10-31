import {Module} from '@nestjs/common';
import {FilesService} from './files.service';
import {FilesController} from './files.controller';
import {MongooseModule} from "@nestjs/mongoose";
import {FileSchema, File} from "./files.schema";
import {JwtModule} from "@nestjs/jwt";

@Module({
  providers: [FilesService],
  controllers: [FilesController],
  imports: [
      MongooseModule.forFeature([{name: File.name, schema: FileSchema}]),
      JwtModule
  ],
  exports: [FilesService]
})
export class FilesModule {}
