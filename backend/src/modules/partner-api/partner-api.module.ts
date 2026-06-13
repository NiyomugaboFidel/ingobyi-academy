import { Module } from '@nestjs/common';
import { CertificatesModule } from '../certificates/certificates.module';
import { EnrollmentsModule } from '../enrollments/enrollments.module';
import { PartnerApiController } from './partner-api.controller';

@Module({
  imports: [EnrollmentsModule, CertificatesModule],
  controllers: [PartnerApiController],
})
export class PartnerApiModule {}
