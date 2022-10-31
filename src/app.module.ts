import {Module} from '@nestjs/common';
import {ConfigModule} from "@nestjs/config";
import {MongooseModule} from "@nestjs/mongoose";
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { FilesModule } from './files/files.module';

@Module({
    imports: [
        ConfigModule.forRoot(),
        MongooseModule.forRoot(String(process.env.DB_URI)),
        UsersModule,
        AuthModule,
        FilesModule
    ],
    controllers: [],
    providers: [],
})

export class AppModule {}
