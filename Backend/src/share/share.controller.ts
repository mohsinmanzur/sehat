import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ShareService } from './share.service';
import { ShareMeasurementDto } from './dto/share-measurement.dto';
import { HealthMeasurementType } from 'src/health_measurement/types/health_measurement.type';
import { ShareGateway } from './websocket/websocket';

@Controller('share')
export class ShareController {
    constructor(
        private readonly shareService: ShareService,
        private readonly shareGateway: ShareGateway,
    ) { }

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

    @Get('shared-measurements')
    async getSharedMeasurements(@Query('share_id') shareId: string): Promise<HealthMeasurementType[]> {
        return await this.shareService.getSharedMeasurements(shareId);
    }

    @Post('revoke')
    async revokeShare(
        @Query('patient_id') patientId: string,
        @Query('share_id') shareId: string
    ) {
        return await this.shareService.revokeShare(patientId, shareId);
    }

    @Post('webhook')
    async WebhookHandler(@Body() body: { receiverUuid: string, sharingId: string }) {
        this.shareGateway.notifyReceiverCompletedShare(body.receiverUuid, {
            sharingId: body.sharingId,
            success: true
        });

        return { message: 'Share executed successfully' };
    }
}
