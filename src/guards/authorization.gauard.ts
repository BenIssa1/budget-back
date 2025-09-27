import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Observable } from "rxjs";
import { ROLES_KEY } from "src/decorators/roles.decorator";

@Injectable()
export class AuthorizationGuard implements CanActivate {
  constructor(private reflector: Reflector){}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
   
    const requiredRoles = this.reflector.getAllAndOverride(ROLES_KEY, [
      context.getHandler(),
      context.getClass()
    ]);

    if (requiredRoles.includes(request.user.role)) return true;
    return false;
  }
}