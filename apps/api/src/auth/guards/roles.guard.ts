import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserPlan } from '@prisma/client';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPlans = this.reflector.getAllAndOverride<UserPlan[]>('plans', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPlans) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    return requiredPlans.some((plan) => user.plan === plan);
  }
}
