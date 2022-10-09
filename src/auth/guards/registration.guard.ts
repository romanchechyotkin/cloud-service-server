import {Injectable, CanActivate, ExecutionContext, UnauthorizedException} from '@nestjs/common';
import {Observable} from 'rxjs';
import {AuthService} from "../auth.service";

@Injectable()
export class RegistrationGuard implements CanActivate {

    constructor(private authService: AuthService) {}

    // @ts-ignore
    async canActivate(context: ExecutionContext): Promise<boolean | Promise<boolean> | Observable<boolean>> {
        const request = context.switchToHttp().getRequest();
        const {email} = request.body
        const user = await this.authService.validateUser(email)
        if (user) {
            throw new UnauthorizedException('User ' + user.email + ' exists')
        }
        return true;
    }
}
