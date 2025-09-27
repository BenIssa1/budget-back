import { IsEmail, IsNotEmpty } from "class-validator";

export class SignupDto {
  @IsNotEmpty()
  readonly firstName: string;

  @IsNotEmpty()
  readonly lastName: string;

  @IsEmail()
  readonly email: string;

  @IsNotEmpty()
  readonly password: string;
}