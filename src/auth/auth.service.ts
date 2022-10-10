import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import {CreateUserDto} from "../users/dto/create-user.dto";
import {UsersService} from "../users/users.service";
import * as bcrypt from 'bcryptjs'
import {JwtService} from "@nestjs/jwt";
import {jwtConstants} from "./constants";

@Injectable()
export class AuthService {

    constructor(private usersService: UsersService,
                private jwtService: JwtService) {}

    async registration(dto: CreateUserDto) {
        const candidate = await this.usersService.findOne(dto.email)
        if (candidate) {
            return null
        }
        const hashPassword = await bcrypt.hash(dto.password, 2)
        const createdUser = await this.usersService.createUser({email: dto.email, password: hashPassword})
        return createdUser
    }

    async login(dto: CreateUserDto) {
        const user = await this.usersService.findOne(dto.email)
        if (!user) {
            throw new HttpException('user not found', HttpStatus.BAD_REQUEST)
        }
        const validPassword = await bcrypt.compare(dto.password, user.password)
        if (!validPassword) {
            throw new HttpException('wrong password', HttpStatus.BAD_REQUEST)
        }
        const accessToken = await this.generateAccessToken(user)
        const refreshToken = await this.generateRefreshToken(user._id)
        return {user, ...accessToken, ...refreshToken}
    }

    async generateAccessToken(user) {
        return {
            accessToken: this.jwtService.sign({user})
        }
    }

    async generateRefreshToken(userId) {
        return {
            refreshToken: this.jwtService.sign({userId}, {secret: jwtConstants.secret, expiresIn: '30d'})
        }
    }


    async validateUser(email: string) {
        const user = await this.usersService.findOne(email)
        if (!user) {
            return null
        }
        return user
    }
}
