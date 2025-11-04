import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

type Constructor<T = unknown> = new (...args: unknown[]) => T;

@Injectable()
export class ValidationPipe implements PipeTransform<unknown> {
  async transform(value: unknown, { metatype }: ArgumentMetadata) {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }
    const object = plainToInstance(metatype as Constructor, value);
    const errors = await validate(object as object);
    if (errors.length > 0) {
      const messages = errors.map((error) => {
        return Object.values(error.constraints || {}).join(', ');
      });
      throw new BadRequestException({
        message: 'Validation failed',
        errors: messages,
      });
    }
    return value;
  }

  private toValidate(metatype: Constructor): boolean {
    const types: Constructor[] = [
      String as unknown as Constructor,
      Boolean as unknown as Constructor,
      Number as unknown as Constructor,
      Array as unknown as Constructor,
      Object as unknown as Constructor,
    ];
    return !types.includes(metatype);
  }
}
