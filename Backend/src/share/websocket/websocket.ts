import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: true })
export class ShareGateway {
    @WebSocketServer()
    server: Server;

    // The Receiver calls this when their QR screen opens
    @SubscribeMessage('join-share-room')
    handleJoinRoom(
        @ConnectedSocket() client: Socket,
        @MessageBody() receiverUuid: string
    ) {
        // Puts the client in a specific room just for them
        client.join(`share_room_${receiverUuid}`);
        console.log(`Client joined room: share_room_${receiverUuid}`);
    }

    // The Controller will call this function after saving to Postgres
    notifyReceiverCompletedShare(receiverUuid: string, sharingData: any) {
        this.server
            .to(`share_room_${receiverUuid}`)
            .emit('share-received', sharingData);
    }
}