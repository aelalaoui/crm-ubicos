import { SetMetadata } from '@nestjs/common';
import { UserPlan } from '@prisma/client';

export const Plans = (...plans: UserPlan[]) => SetMetadata('plans', plans);
