import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import {MongooseModule} from "@nestjs/mongoose";
import {User, UserSchema} from "./user.schema";

@Module({
    providers: [UsersService],
    imports: [
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])
    ],
    exports: [UsersService]
})

export class UsersModule {}
