import { Controller, Get, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { AuthenticatedUser } from '../../common/interfaces/request-with-user.interface';
import { ParseCuidPipe } from '../../common/pipes/parse-cuid.pipe';
import { CertificatesService } from './certificates.service';

@ApiTags('Certificates')
@Controller('certificates')
export class CertificatesController {
  constructor(private readonly certificatesService: CertificatesService) {}

  @Post('generate/:courseId')
  @ApiOperation({ summary: 'Generate certificate on completion' })
  generate(
    @CurrentUser() user: AuthenticatedUser,
    @Param('courseId', ParseCuidPipe) courseId: string,
  ) {
    return this.certificatesService.generate(user.userId, courseId);
  }

  @Get('mine')
  @ApiOperation({ summary: 'My certificates' })
  mine(@CurrentUser() user: AuthenticatedUser) {
    return this.certificatesService.mine(user.userId);
  }

  @Public()
  @Get('verify/:code')
  @ApiOperation({ summary: 'Verify certificate (public)' })
  verify(@Param('code') code: string) {
    return this.certificatesService.verify(code);
  }
}
