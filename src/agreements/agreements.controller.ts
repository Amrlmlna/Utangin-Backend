import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  UseGuards,
  NotFoundException,
  Query
} from '@nestjs/common';
import { AgreementsService, Agreement } from './agreements.service';
import { CreateAgreementDto } from './dto/create-agreement.dto';
import { UpdateAgreementDto } from './dto/update-agreement.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('agreements')
export class AgreementsController {
  constructor(private readonly agreementsService: AgreementsService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  async create(@Body() createAgreementDto: CreateAgreementDto): Promise<Agreement> {
    return this.agreementsService.create(createAgreementDto);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  async findAll(): Promise<Agreement[]> {
    return this.agreementsService.findAll();
  }

  @Get('user/:userId')
  @UseGuards(AuthGuard('jwt'))
  async findByUser(@Param('userId') userId: string): Promise<Agreement[]> {
    return this.agreementsService.findByUser(userId);
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  async findOne(@Param('id') id: string): Promise<Agreement> {
    try {
      return await this.agreementsService.findOne(id);
    } catch (error) {
      throw new NotFoundException('Agreement not found');
    }
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'))
  async update(@Param('id') id: string, @Body() updateAgreementDto: UpdateAgreementDto): Promise<Agreement> {
    return this.agreementsService.update(id, updateAgreementDto);
  }

  @Put(':id/confirm/:party')
  @UseGuards(AuthGuard('jwt'))
  async confirmAgreement(
    @Param('id') id: string,
    @Param('party') party: 'lender' | 'borrower'
  ): Promise<Agreement> {
    return this.agreementsService.confirmAgreement(id, party);
  }

  @Put(':id/paid')
  @UseGuards(AuthGuard('jwt'))
  async markAsPaid(@Param('id') id: string): Promise<Agreement> {
    return this.agreementsService.markAsPaid(id);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  async remove(@Param('id') id: string): Promise<void> {
    return this.agreementsService.remove(id);
  }
}
