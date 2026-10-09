import {
  type CredentialsPayload,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  type RegisterPayload,
} from '@org/contracts';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class LoginDto implements CredentialsPayload {
  @IsEmail()
  @MaxLength(254)
  email!: string;

  // No length rules here: they would reveal the password policy to guessers
  // and reject valid passwords if the policy changes. Only cap hashing work.
  @IsString()
  @IsNotEmpty()
  @MaxLength(PASSWORD_MAX_LENGTH)
  password!: string;
}

export class RegisterDto implements RegisterPayload {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;

  @IsEmail()
  @MaxLength(254)
  email!: string;

  @IsString()
  @MinLength(PASSWORD_MIN_LENGTH)
  @MaxLength(PASSWORD_MAX_LENGTH)
  password!: string;
}
