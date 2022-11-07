import {Module} from '@nestjs/common';
import {FilesService} from './files.service';
import {FilesController} from './files.controller';
import {MongooseModule} from "@nestjs/mongoose";
import {FileSchema, File} from "./files.schema";
import {JwtModule} from "@nestjs/jwt";
import {UsersModule} from "../users/users.module";

@Module({
  providers: [FilesService],
  controllers: [FilesController],
  imports: [
      MongooseModule.forFeature([{name: File.name, schema: FileSchema}]),
      JwtModule,
      UsersModule,
  ],
  exports: [FilesService]
})
export class FilesModule {}
