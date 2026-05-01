import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ShareService } from './share.service';
import { ShareMeasurementDto } from './dto/share-measurement.dto';

@Controller('share')
export class ShareController {
    constructor(private readonly shareService: ShareService) { }

    @Post()
    async shareMeasurement(
        @Query('patient_id') patientId: string,
        @Body() shareDto: ShareMeasurementDto
    ) {
        return await this.shareService.shareMeasurement(patientId, shareDto);
    }

    @Get('shares')
    async getPatientShares(@Query('patient_id') patientId: string) {
        return await this.shareService.getPatientShares(patientId);
    }

    @Post('revoke')
    async revokeShare(
        @Query('patient_id') patientId: string,
        @Query('share_id') shareId: string
    ) {
        return await this.shareService.revokeShare(patientId, shareId);
    }
}
