import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'db', // مهم جداً: نستخدم اسم الخدمة المعرف في docker-compose
      port: 5432,
      username: 'user_admin',
      password: 'password123',
      database: 'wasel_palestine',
      autoLoadEntities: true,
      // synchronize: false تعني أننا نعتمد على جداولك التي أنشأتها في schemas.sql
      synchronize: false, 
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}