import { IsNotEmpty } from "class-validator";

export class SigninDto {
  @IsNotEmpty()
  readonly email: string;

  @IsNotEmpty()
  readonly password: string;
}