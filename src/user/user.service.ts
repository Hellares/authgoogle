import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(@InjectRepository(User) private UserRepo: Repository<User>) {}

  // async updateHashedRefreshToken(userId: number, hashedRefreshToken: string) {
  //   return await this.UserRepo.update({ id: userId }, { hashedRefreshToken });
  // }

  async updateHashedRefreshToken(
    userId: number, 
    hashedRefreshToken: string | null
  ): Promise<void> {
    await this.UserRepo.update(userId, { hashedRefreshToken });
  }

  // async create(createUserDto: CreateUserDto) {
  //   const user = await this.UserRepo.create(createUserDto);
  //   return await this.UserRepo.save(user);
  // }
  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.UserRepo.create({
      ...createUserDto,
      // Asegúrate de que el provider está establecido
      provider: createUserDto.provider || 'local',
    });
    return await this.UserRepo.save(user);
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return this.UserRepo.findOne({ where: { email } });
  }

  findAll() {
    return `This action returns all user`;
  }

  async findOne(id: number) {
    return this.UserRepo.findOne({
      where: { id },
      select: [
        'id',
        'firstName',
        'lastName',
        'avatarUrl',
        'hashedRefreshToken',
        'role',
      ],
    });
  }

  async update(id: number, updateUserDto: Partial<User>): Promise<User> {
    await this.UserRepo.update(id, updateUserDto);
    return this.findOne(id);
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
