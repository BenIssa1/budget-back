import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { SignupDto } from './dto/signup.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import * as speakeasy from 'speakeasy';
import { PrismaService } from 'src/prisma/prisma.service';
import { SigninDto } from './dto/signin.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { SmsService } from 'src/sms/sms.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly smsService: SmsService,
  ) { }

  async signup(signupDto: SignupDto) {
    const { firstName, lastName, email, password } = signupDto;
    // ** Vérifier si l'utilisateur est déja inscrit
    const user = await this.prismaService.user.findUnique({ where: { email } });
    if (user) throw new ConflictException('User already exists');
    // ** Hasher le mot de passe
    const hash = await bcrypt.hash(password, 10);
    // ** Enregistrer l'utilisateur dans la base de données
    await this.prismaService.user.create({ data: { email, firstName, lastName, password: hash } })
    // ** Retourner une réponse de succès
    return { message: 'User successfully created' }
  }

  async signin(signinDto: SigninDto) {
    const { email, password } = signinDto;
    // ** Vérifier si l'utilisateur est déja inscrit
    const user = await this.prismaService.user.findUnique({ where: { email } });
    if (!user) throw new NotFoundException('Utilisateur introuvable !');
    // ** Comparer le mot de passe
    const match = await bcrypt.compare(password, user.password);
    if (!match) throw new UnauthorizedException('Le mot de passe ne correspond pas !');
    // ** Retourner un token jwt
    const payload = {
      sub: user.id,
      email: user.email
    };
    const token = this.jwtService.sign(payload, {
      expiresIn: '2h',
      secret: this.configService.get('SECRET_KEY')
    });

    return {
      token, user: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      }
    };
  }

  async getAllAccount() {
    // ** Vérifier si l'utilisateur existe
    const users = await this.prismaService.user.findMany();
    return {
        users
    };
  }

  async updateUser(id: number, updateUserDto: UpdateUserDto) {
    // ** Vérifier si l'utilisateur existe
    const user = await this.prismaService.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    
    // ** Si l'email est modifié, vérifier qu'il n'existe pas déjà
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.prismaService.user.findUnique({ where: { email: updateUserDto.email } });
      if (existingUser) throw new ConflictException('Email already exists');
    }
    
    // ** Si le mot de passe est modifié, le hasher
    const updateData = { ...updateUserDto };
    if (updateUserDto.password) {
      updateData.password = await bcrypt.hash(updateUserDto.password, 10);
    }
    
    return this.prismaService.user.update({ where: { id }, data: updateData });
  }

  async removeUser(id: number) {
    // ** Vérifier si l'utilisateur existe
    const user = await this.prismaService.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    
    return this.prismaService.user.delete({ where: { id } });
  }
}
