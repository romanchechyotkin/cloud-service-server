import {Injectable} from '@nestjs/common';
import {CreateUserDto} from "../users/dto/create-user.dto";
import {UsersService} from "../users/users.service";

@Injectable()
export class AuthService {

    constructor(private usersService: UsersService) {}

    async registration(dto: CreateUserDto) {
        const candidate = await this.usersService.findOne(dto.email)
        if (candidate) {
            return null
        }
        const createdUser = await this.usersService.createUser(dto)
        return createdUser
    }

    async login(dto: CreateUserDto) {
        const candidate = await this.usersService.findOne(dto.email)
        if (!candidate) {
            return null
        }
        return candidate
    }

    async validateUser(email: string) {
        const user = await this.usersService.findOne(email)
        if (!user) {
            return null
        }
        return user
    }
}
