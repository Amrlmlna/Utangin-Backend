import { 
  Controller, 
  Post, 
  Get, 
  Body, 
  Param, 
  UseGuards,
  BadRequestException
} from '@nestjs/common';
import { QrService } from './qr.service';
import { ConfirmAgreementDto, ConfirmationParty } from './dto/confirm-agreement.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('qr')
export class QrController {
  constructor(private readonly qrService: QrService) {}

  @Post('generate/:agreementId')
  @UseGuards(AuthGuard('jwt'))
  async generateQR(@Param('agreementId') agreementId: string) {
    try {
      return await this.qrService.generateQRCode(agreementId);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post('verify')
  @UseGuards(AuthGuard('jwt'))
  async verifyQR(@Body('qr_data') qrData: string) {
    try {
      return await this.qrService.verifyQRCode(qrData);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post('confirm')
  @UseGuards(AuthGuard('jwt'))
  async confirmAgreement(@Body() confirmAgreementDto: ConfirmAgreementDto) {
    try {
      const { qr_data, confirmed_by } = confirmAgreementDto;
      const result = await this.qrService.validateAndConfirmAgreement(
        qr_data, 
        confirmed_by as 'lender' | 'borrower'
      );
      return { success: result };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}