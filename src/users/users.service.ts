import {Injectable} from '@nestjs/common';
import {InjectModel} from "@nestjs/mongoose";
import {User, UserDocument} from "./user.schema";
import {Model} from "mongoose";
import {CreateUserDto} from "./dto/create-user.dto";

@Injectable()
export class UsersService {

    constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

    async createUser(dto: CreateUserDto) {
        const user = await this.userModel.create(dto)
        return user
    }

    async findOne(email: string) {
        const user = await this.userModel.findOne({email})
        return user
    }

}
