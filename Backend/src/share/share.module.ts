import { Module } from '@nestjs/common';
import { ShareService } from './share.service';
import { ShareController } from './share.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Access_Grant } from '../entities/access_grant.entity';
import { DoctorModule } from '../doctor/doctor.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Access_Grant]),
    DoctorModule
  ],
  controllers: [ShareController],
  providers: [ShareService],
})
export class ShareModule {}
