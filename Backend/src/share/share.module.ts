import { Module } from '@nestjs/common';
import { ShareService } from './share.service';
import { ShareController } from './share.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Access_Grant } from '../entities/access_grant.entity';
import { DoctorModule } from '../doctor/doctor.module';
import { Health_Measurement } from '../entities/health_measurement.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Access_Grant, Health_Measurement]),
    DoctorModule
  ],
  controllers: [ShareController],
  providers: [ShareService],
})
export class ShareModule {}
