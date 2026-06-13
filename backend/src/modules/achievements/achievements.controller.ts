import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { AuthenticatedUser } from '../../common/interfaces/request-with-user.interface';
import { ParseCuidPipe } from '../../common/pipes/parse-cuid.pipe';
import { AchievementsService } from './achievements.service';
import { CreateAchievementDto } from './dto/create-achievement.dto';

@ApiTags('Achievements')
@Controller('achievements')
export class AchievementsController {
  constructor(private readonly achievementsService: AchievementsService) {}

  @Get('definitions')
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'List achievement definitions' })
  listDefinitions() {
    return this.achievementsService.listDefinitions();
  }

  @Post('definitions')
  @Roles(UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Create achievement definition' })
  createDefinition(@Body() dto: CreateAchievementDto) {
    return this.achievementsService.createDefinition(dto);
  }

  @Patch('definitions/:id')
  @Roles(UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Update achievement definition' })
  updateDefinition(
    @Param('id', ParseCuidPipe) id: string,
    @Body() dto: Partial<CreateAchievementDto>,
  ) {
    return this.achievementsService.updateDefinition(id, dto);
  }

  @Get('mine')
  @ApiOperation({ summary: 'My earned achievements' })
  mine(@CurrentUser() user: AuthenticatedUser) {
    return this.achievementsService.mine(user.userId);
  }

  @Post('award/:userId/:defId')
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Manually award achievement' })
  award(
    @CurrentUser() user: AuthenticatedUser,
    @Param('userId', ParseCuidPipe) userId: string,
    @Param('defId', ParseCuidPipe) defId: string,
  ) {
    return this.achievementsService.award(userId, defId, user.userId);
  }
}
