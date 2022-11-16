import {
    CanActivate,
    ExecutionContext,
    HttpException,
    HttpStatus,
    Injectable,
    UnauthorizedException
} from "@nestjs/common";
import {Observable} from "rxjs";
import {JwtService} from "@nestjs/jwt";
import {jwtConstants} from "../../auth/constants";

@Injectable()
export class FilesGuard implements CanActivate {

    constructor(private jwtService: JwtService) {}

    // @ts-ignore
    async canActivate(context: ExecutionContext): Promise<boolean | Promise<boolean> | Observable<boolean>> {
        const req = context.switchToHttp().getRequest();
        try {
            const authHeader = req.headers.authorization;
            const bearer = authHeader.split(' ')[0]
            const token = authHeader.split(' ')[1]

            if (bearer !== 'Bearer' || !token) {
                throw new HttpException('user not login', HttpStatus.UNAUTHORIZED)
            }

            const user = this.jwtService.verify(token, {secret: jwtConstants.secret});
            return req.user = user
        }
        catch (e) {
            console.log(e)
            throw new HttpException('user not login', HttpStatus.UNAUTHORIZED)
        }
    }
}
