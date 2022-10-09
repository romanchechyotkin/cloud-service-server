import {Body, Controller, HttpStatus, Post, Res, UseGuards} from '@nestjs/common';
import {CreateUserDto} from "../users/dto/create-user.dto";
import {AuthService} from "./auth.service";
import {Response} from "express";
import {RegistrationGuard} from "./guards/registration.guard";
import {LoginGuard} from "./guards/login.guard";

@Controller('auth')
export class AuthController {

    constructor(private authService: AuthService) {}

    @UseGuards(RegistrationGuard)
    @Post('/registration')
    async registration(
        @Body() createUserDto: CreateUserDto,
        @Res() res: Response
    ) {
        const user = await this.authService.registration(createUserDto)
        res.statusCode = HttpStatus.CREATED
        return res.send(`user ${user.email} created`)
    }

    @UseGuards(LoginGuard)
    @Post('/login')
    async login(
        @Body() createUserDto: CreateUserDto,
        @Res() res: Response
    ) {
        const user = await this.authService.login(createUserDto)
        res.statusCode = HttpStatus.OK
        return res.send(user)
    }

}
