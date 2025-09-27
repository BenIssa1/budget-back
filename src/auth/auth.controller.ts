import { Body, Controller, Get, Post, Put, Delete, Param, UseGuards } from '@nestjs/common';
import { SignupDto } from './dto/signup.dto';
import { AuthService } from './auth.service';
import { SigninDto } from './dto/signin.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Roles } from 'src/decorators/roles.decorator';
import { AuthGuard } from '@nestjs/passport';
import { AuthorizationGuard } from 'src/guards/authorization.gauard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Roles(['Admin'])
  @UseGuards(AuthGuard('jwt'), AuthorizationGuard)
  @Post("signup")
  signup(@Body() signupDto: SignupDto) {
    return this.authService.signup(signupDto);
  }

  @Post("signin")
  signin(@Body() signinDto: SigninDto) {
    return this.authService.signin(signinDto);
  }

  @Roles(['Admin'])
  @UseGuards(AuthGuard('jwt'), AuthorizationGuard)
  @Get("users")
  getAllAccount() {
    return this.authService.getAllAccount();
  }

  @Roles(['Admin'])
  @UseGuards(AuthGuard('jwt'), AuthorizationGuard)
  @Put("users/:id")
  updateUser(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.authService.updateUser(+id, updateUserDto);
  }

  @Roles(['Admin'])
  @UseGuards(AuthGuard('jwt'), AuthorizationGuard)
  @Delete("users/:id")
  removeUser(@Param('id') id: string) {
    return this.authService.removeUser(+id);
  }
}
