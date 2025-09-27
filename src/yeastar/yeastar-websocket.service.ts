import {
    Injectable,
    OnModuleInit,
    OnModuleDestroy,
    Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as WebSocket from 'ws';
import { CallSessionService } from './call-session.service';
import { YeastarService } from './yeastar.service';
import { ConfigurationService } from 'src/configuration/configuration.service';

@Injectable()
export class YeastarWebSocketService implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(YeastarWebSocketService.name);
    private ws: WebSocket | null = null;

    constructor(
        private readonly config: ConfigService,
        private readonly yeastarService: YeastarService,
        private readonly callSessionService: CallSessionService,
        private readonly configurationService: ConfigurationService,
    ) { }

    onModuleInit() {
        this.connect();
    }

    onModuleDestroy() {
        this.ws?.close();
    }

    private async connect() {
        try {
            const token = await this.yeastarService.ensureValidToken();
            //const token = 'LqAqcGWDAFzdbDSYRa52esFnsalvVVH8';
            
            // Récupérer la configuration active pour obtenir l'IP
            const config = await this.configurationService.findActive();
            if (!config) {
                throw new Error('No active configuration found');
            }
            
            const domain = config.ip; // Utiliser l'IP de la configuration
            const apiPath = this.config.get<string>('YEASTAR_API_PATH') || 'openapi/v1.0';

            const wsUrl = `wss://${domain}:8088/${apiPath}/subscribe?access_token=${token}`;
            this.logger.log(`🔌 Connexion WebSocket à ${wsUrl}`);

            this.ws = new WebSocket(wsUrl, {
                rejectUnauthorized: false, // nécessaire si certificat auto-signé
            });

            this.ws.on('open', () => {
                this.logger.log('✅ Connecté à la WebSocket Yeastar');

                const subscription = {
                    topic_list: [30011, 30012]
                };
                this.ws?.send(JSON.stringify(subscription));
            });

           
            this.ws.on('message', async (data: WebSocket.RawData) => {
                const payload = JSON.parse(data.toString());
                //this.logger.debug(`📩 Payload JSON: ${JSON.stringify(payload, null, 2)}`);

                 switch (payload.type) {
                    case 10000:
                        this.logger.log("✅ Abonnement WebSocket confirmé !");
                        break;
                    case 30011: // Call status update
                        const callData = JSON.parse(payload.msg);
                        const callId = callData.call_id;
                        const members = callData.members;

                        const extensionMember = members.find(m => m.extension);
                        const outboundMember = members.find(m => m.outbound); 

                        if (!extensionMember || !outboundMember) {
                            this.logger.warn('Membres d’appel incomplets');
                            break;
                        }

                        const extensionNumber = extensionMember.extension.number;
                        const extensionStatus = extensionMember.extension.member_status; // ALERT, RING, ANSWERED...
                        const extensionChannelId = extensionMember.extension.channel_id;
                        const calledNumber = outboundMember.outbound.number; // Numéro appelé

                        if (extensionStatus === 'ANSWERED') {
                            this.logger.log(`✅ Appel décroché sur extension ${extensionNumber} vers ${calledNumber} (callId: ${callId})`);
                            await this.callSessionService.startCall(extensionNumber, callId, extensionChannelId,  outboundMember.outbound.to);
                        } else if (extensionStatus === 'ALERT' || extensionStatus === 'RING') {
                            this.logger.log(`📞 Sonnerie sur extension ${extensionNumber} vers ${calledNumber} (callId: ${callId})`);
                        }

                        break;


                    case 30012: // New CDR
                        const cdr = JSON.parse(payload.msg);
                        await this.callSessionService.endCall(cdr.call_from, cdr.call_id, cdr.call_to);
                        this.logger.log(`Nouveau CDR: Appel ${cdr.type} de ${cdr.call_from} vers ${cdr.call_to}, durée ${cdr.call_duration}s`);
                        break; 

                    default:
                        this.logger.warn(`Événement inconnu: ${payload.type}`);
                } 
            });

            this.ws.on('close', () => {
                this.logger.warn(
                    '🔌 Connexion WebSocket fermée. Reconnexion dans 5s...',
                );
                setTimeout(() => this.connect(), 5000);
            });

            this.ws.on('error', (err) => {
                this.logger.error('❌ Erreur WebSocket :', err);
            });
        } catch (err) {
            this.logger.error('❌ Impossible de se connecter à Yeastar WS', err);
        }
    }
}
