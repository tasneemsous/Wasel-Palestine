import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { RoutesService } from './routes.service';
import { EstimateRouteDto } from './estimate-route.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('routes')
@UseGuards(JwtAuthGuard)
export class RoutesController {
  constructor(private readonly routesService: RoutesService) {}

  /**
   * Heuristic route estimate between two coordinates (not turn-by-turn routing).
   */
  @Post('estimate')
  estimate(@Body() dto: EstimateRouteDto) {
    return this.routesService.estimate(dto);
  }
}
