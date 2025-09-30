import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import * as https from 'https';
import { PaidPricingService } from '../paid-pricing/paid-pricing.service';
import { PricingFreeService } from '../pricing-free/pricing-free.service';
import { YeastarService } from './yeastar.service';
import { ConfigurationService } from 'src/configuration/configuration.service';

@Injectable()
export class CallSessionService {
    private readonly logger = new Logger(CallSessionService.name);
    private readonly timers = new Map<string, NodeJS.Timeout>();

    constructor(
        private readonly prisma: PrismaService,
        private readonly httpService: HttpService,
        private readonly paidPricingService: PaidPricingService,
        private readonly pricingFreeService: PricingFreeService,
        private readonly yeastarService: YeastarService,
        private readonly configurationService: ConfigurationService,
    ) { }

    async startCall(extensionNumber: string, callId: string, extensionChannelId: string, calledNumber?: string) {
        const existingCall = await this.prisma.call.findUnique({
            where: { call_id: callId },
        });

        if (existingCall) {
            this.logger.log(`Appel ${callId} déjà démarré, on ne modifie pas la date de début.`);
            return;
        }

        const extension = await this.prisma.extension.findUnique({
            where: { number: extensionNumber },
        });

        if (!extension) {
            this.logger.warn(`Extension ${extensionNumber} introuvable.`);
            return;
        }

        // Vérifier si le numéro appelé est gratuit
        let isFreeCall = false;
        if (calledNumber) {
            isFreeCall = await this.pricingFreeService.isFreeNumber(calledNumber);
        }

        let maxMinutes = 0;
        let pricePerMinute = 0;

        if (isFreeCall) {
            // Pour les appels gratuits, on peut parler indéfiniment
            maxMinutes = 999999; // Très grand nombre pour éviter le timeout
            this.logger.log(`🆓 Appel gratuit vers ${calledNumber} - Pas de limite de temps`);
        } else {
            // Obtenir le prix par minute basé sur le numéro appelé
            pricePerMinute = 100; // Prix par défaut
            if (calledNumber) {
                pricePerMinute = await this.paidPricingService.getPricingForNumber(calledNumber);
            } else {
                this.logger.log(`⚠️ Numéro appelé non fourni, utilisation du prix par défaut: ${pricePerMinute}`);
            }

            maxMinutes = Math.floor(extension.balance / pricePerMinute);
        }

        const durationSeconds = maxMinutes * 60;

        this.logger.log(`📞 Appel démarré - ${extension.number} | Solde: ${extension.balance} | Prix/min: ${pricePerMinute} | Limite: ${maxMinutes} min`);

        await this.prisma.call.create({
            data: {
                call_id: callId,
                extension_number: extension.number,
                extensionId: extension.id,
                start_time: new Date(),
            },
        });

        const timeout = setTimeout(async () => {
            this.logger.log(`⏰ Temps écoulé pour ${extension.number}, raccrochage...`);
            await this.hangupCall(extensionNumber, extensionChannelId, calledNumber);
        }, durationSeconds * 1000);

        this.timers.set(callId, timeout);
    }

    async endCall(extensionNumber: string, callId: string, calledNumber?: string) {
        const extension = await this.prisma.extension.findUnique({
            where: { number: extensionNumber },
        });

        if (!extension) {
            this.logger.warn(`Extension ${extensionNumber} introuvable.`);
            return;
        }

        const call = await this.prisma.call.findUnique({
            where: { call_id: callId },
        });

        if (!call || !call.start_time) {
            this.logger.warn(`Call ${callId} introuvable ou start_time manquant.`);
            return;
        }

        const endTime = new Date();
        const durationInSeconds = Math.floor((endTime.getTime() - call.start_time.getTime()) / 1000);

        // Calcul durée en minutes arrondie à la minute supérieure
        const durationInMinutes = Math.ceil(durationInSeconds / 60);

        // Vérifier si le numéro appelé est gratuit
        let isFreeCall = false;
        if (calledNumber) {
            isFreeCall = await this.pricingFreeService.isFreeNumber(calledNumber);
            if (isFreeCall) {
                this.logger.log(`🆓 Appel gratuit vers ${calledNumber} - Aucune déduction`);
            }
        }

        let cost = 0;
        let pricePerMinute = 0;

        if (!isFreeCall) {
            // Obtenir le prix par minute basé sur le numéro appelé
            pricePerMinute = 100; // Prix par défaut
            if (calledNumber) {
                pricePerMinute = await this.paidPricingService.getPricingForNumber(calledNumber);
                this.logger.log(`💰 Tarification pour ${calledNumber}: ${pricePerMinute} par minute`);
            } else {
                this.logger.log(`⚠️ Numéro appelé non fourni, utilisation du prix par défaut: ${pricePerMinute}`);
            }

            cost = durationInMinutes * pricePerMinute;
        }

        this.logger.log(
            `📞 Fin appel ${callId} - Durée: ${durationInMinutes} min (réel ${durationInSeconds}s) | Coût: ${cost} ${isFreeCall ? '(GRATUIT)' : `(${pricePerMinute}/min)`}`,
        );

        if (extension.balance === 0) {
            await this.prisma.extension.update({
                where: { number: extensionNumber },
                data: {
                    balance: 0,
                },
            });

            this.logger.log(`💰 Solde de l'extension ${extensionNumber} mis à zéro`);
        } else if (!isFreeCall) {
            // Déduire le coût du solde seulement si ce n'est pas un appel gratuit
            await this.prisma.extension.update({
                where: { number: extensionNumber },
                data: {
                    balance: extension.balance - cost,
                },
            });

            this.logger.log(`💰 Coût de ${cost} déduit du solde de l'extension ${extensionNumber}`);
        }

        // Mettre à jour l'appel avec fin, durée et coût (même pour les appels gratuits)
        await this.prisma.call.update({
            where: { call_id: callId },
            data: {
                end_time: endTime,
                duration_seconds: durationInSeconds,
                cost,
            },
        });

        // Nettoyer le timer si il existe
        const timeout = this.timers.get(callId);
        if (timeout) {
            clearTimeout(timeout);
            this.timers.delete(callId);
        }
    }

    async checkBalanceAndHangupIfNeeded(extensionNumber: string, extensionChannelId: string, calledNumber?: string) {
        const extension = await this.prisma.extension.findUnique({
            where: { number: extensionNumber },
        });

        if (!extension) {
            this.logger.warn(`Extension ${extensionNumber} introuvable.`);
            return;
        }

        // Vérifier si le numéro appelé est gratuit
        let isFreeCall = false;
        if (calledNumber) {
            isFreeCall = await this.pricingFreeService.isFreeNumber(calledNumber);
        }

        // Si c'est un appel gratuit, on ne vérifie pas le solde
        if (isFreeCall) {
            this.logger.log(`🆓 Appel gratuit vers ${calledNumber} - Pas de vérification de solde`);
            return;
        }

        // Vérifier si l'extension a un solde suffisant
        let pricePerMinute = 100; // Prix par défaut
        if (calledNumber) {
            pricePerMinute = await this.paidPricingService.getPricingForNumber(calledNumber);
        }

        const maxMinutes = Math.floor(extension.balance / pricePerMinute);

        if (extension.balance <= 0 || maxMinutes <= 0) {
            this.logger.warn(`💰 Extension ${extensionNumber} n'a pas de solde suffisant (${extension.balance}) pour appeler ${calledNumber} (${pricePerMinute}/min)`);
            
            // Raccrocher immédiatement l'appel
            await this.hangupCall(extensionNumber, extensionChannelId, calledNumber);
        } else {
            this.logger.log(`✅ Extension ${extensionNumber} a un solde suffisant (${extension.balance}) pour ${maxMinutes} minutes`);
        }
    }

    private readonly httpsAgent = new https.Agent({ rejectUnauthorized: false });

    private async hangupCall(extensionNumber: string, extensionChannelId: string, calledNumber?: string) {
        const token = await this.yeastarService.ensureValidToken();
        //const token = 'LqAqcGWDAFzdbDSYRa52esFnsalvVVH8';
        
        // Récupérer la configuration active pour obtenir l'IP
        const config = await this.configurationService.findActive();
        if (!config) {
            throw new Error('No active configuration found');
        }
        
        const domain = config.ip; // Utiliser l'IP de la configuration
        const url = `https://${domain}:8088/openapi/v1.0/call/hangup?access_token=${token}`;

        try {
            const response = await firstValueFrom(
                this.httpService.post(
                    url,
                    { channel_id: extensionChannelId }, // Body JSON
                    {
                        headers: { 'Content-Type': 'application/json' },
                        httpsAgent: this.httpsAgent,
                    }
                )
            );

            if (response.data.errcode !== 0) {
                this.logger.error(`❌ Échec du raccrochage appel ${extensionChannelId}`, response.data);
            } else {
                // Vérifier si c'est un appel gratuit avant de mettre le solde à zéro
                let isFreeCall = false;
                if (calledNumber) {
                    isFreeCall = await this.pricingFreeService.isFreeNumber(calledNumber);
                }

                if (extensionNumber && !isFreeCall) {
                    await this.prisma.extension.updateMany({
                        where: { number: extensionNumber },
                        data: { balance: 0 },
                    });
                    this.logger.log(`💰 Solde de l'extension ${extensionNumber} mis à zéro`);
                } else if (isFreeCall) {
                    this.logger.log(`🆓 Appel gratuit vers ${calledNumber} - Solde non modifié`);
                }
            }
        } catch (error) {
            this.logger.error(`Erreur lors du raccrochage de l'appel ${extensionChannelId}`, error);
        }
    }

}
