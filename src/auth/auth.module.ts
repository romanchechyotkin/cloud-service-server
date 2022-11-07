import {Module} from '@nestjs/common';
import {AuthController} from './auth.controller';
import {AuthService} from './auth.service';
import {UsersModule} from "../users/users.module";
import {JwtModule} from "@nestjs/jwt";
import {jwtConstants} from "./constants";
import {FilesModule} from "../files/files.module";
import {MongooseModule} from "@nestjs/mongoose";
import {File, FileSchema} from "../files/files.schema";

@Module({
    controllers: [AuthController],
    providers: [AuthService],
    imports: [
        UsersModule,
        FilesModule,
        JwtModule.register({
            secret: jwtConstants.secret,
            signOptions: {expiresIn: '24h'},
        }),
        MongooseModule.forFeature([{name: File.name, schema: FileSchema}])
    ],
    exports: [AuthService]
})

export class AuthModule {}
