import {Module} from '@nestjs/common';
import {ConfigModule} from "@nestjs/config";
import {MongooseModule} from "@nestjs/mongoose";
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { FilesModule } from './files/files.module';
import {ServeStaticModule} from "@nestjs/serve-static";
import * as path from "path";

@Module({
    imports: [
        ConfigModule.forRoot(),
        MongooseModule.forRoot(String(process.env.DB_URI)),
        ServeStaticModule.forRoot({
            rootPath: path.resolve(__dirname, 'static'),
        }),
        UsersModule,
        AuthModule,
        FilesModule
    ],
    controllers: [],
    providers: [],
})

export class AppModule {}
