import {IsEmail, Length} from "class-validator";

export class CreateUserDto {

    @IsEmail({}, {message: 'incorrect email'})
    email: string;

    @Length(6, 15, {message: 'password must be more than 5 and less than 16 symbols'})
    password: string;
}
