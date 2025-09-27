import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import * as https from 'https';
import { PrismaService } from 'src/prisma/prisma.service';
import { ConfigurationService } from 'src/configuration/configuration.service';

@Injectable()
export class YeastarService {
    constructor(
        @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
        private readonly httpService: HttpService,
        private readonly prismaService: PrismaService,
        private readonly configurationService: ConfigurationService,
    ) { }

    private async getClientPayload() {
        const config = await this.configurationService.findActive();
        if (!config) {
            throw new Error('No active configuration found');
        }
        
        return {
            username: config.clientId,
            password: config.secretId,
        };
    }

    private async getBaseUrl() {
        const config = await this.configurationService.findActive();
        if (!config) {
            throw new Error('No active configuration found');
        }
        
        return `https://${config.ip}:8088/openapi/v1.0`;
    }


    private readonly httpsAgent = new https.Agent({ rejectUnauthorized: false });

    private async requestNewToken() {
        const baseUrl = await this.getBaseUrl();
        const clientPayload = await this.getClientPayload();
        const url = `${baseUrl}/get_token`;

        const { data } = await firstValueFrom(
            this.httpService.post(url, clientPayload, {
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'OpenAPI',
                },
                httpsAgent: this.httpsAgent,
            }),
        );

        if (data.errcode === 0) {
            const now = Date.now();
            await this.cacheManager.set('yeastar_token', {
                access_token: data.access_token,
                refresh_token: data.refresh_token,
                access_token_expires_at: now + data.access_token_expire_time * 1000,
                refresh_token_expires_at: now + data.refresh_token_expire_time * 1000,
            });
        } else {
            throw new Error(`Failed to get token: ${data.errmsg}`);
        }
    }

    private async refreshToken(refresh_token: string) {
        const baseUrl = await this.getBaseUrl();
        const url = `${baseUrl}/refresh_token`;

        try {
            const { data } = await firstValueFrom(
                this.httpService.post(
                    url,
                    { refresh_token },
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            'User-Agent': 'OpenAPI',
                        },
                        httpsAgent: this.httpsAgent,
                    },
                ),
            );

            if (data.errcode === 0) {
                const now = Date.now();
                await this.cacheManager.set('yeastar_token', {
                    access_token: data.access_token,
                    refresh_token: data.refresh_token,
                    access_token_expires_at: now + data.access_token_expire_time * 1000,
                    refresh_token_expires_at: now + data.refresh_token_expire_time * 1000,
                });
            } else {
                // 👇 refresh token invalide => on redemande un nouveau token
                console.warn('Refresh token failed:', data.errmsg);
                await this.requestNewToken();
            }
        } catch (error) {
            // 👇 erreur réseau ou structurelle => on redemande un nouveau token
            console.error('Refresh token error:', error.message);
            await this.requestNewToken();
        }
    }


    public async ensureValidToken(): Promise<string> {
        const tokenData: any = await this.cacheManager.get('yeastar_token');
        const now = Date.now();

        console.log(tokenData)

        if (!tokenData || now > tokenData.refresh_token_expires_at) {
            await this.requestNewToken();
        } else if (now > tokenData.access_token_expires_at) {
            await this.refreshToken(tokenData.refresh_token);
        }

        const finalToken = await this.cacheManager.get<any>('yeastar_token');
        return finalToken.access_token;
    }

    // Exemple d’appel d’API protégée avec token géré
    async callProtectedApi() {
        const token = await this.ensureValidToken();

        return token;
    }

    async saveExtensionsToDB(extensions: any[]) {
        for (const ext of extensions) {
            await this.prismaService.extension.upsert({
                where: { number: ext.number },
                update: {
                    id: ext.id,
                    callerIdName: ext.caller_id_name,
                    emailAddr: ext.email_addr,
                    mobileNumber: ext.mobile_number,
                    timezone: ext.timezone,
                    presenceStatus: ext.presence_status,
                },
                create: {
                    id: ext.id,
                    number: ext.number,
                    callerIdName: ext.caller_id_name,
                    emailAddr: ext.email_addr,
                    mobileNumber: ext.mobile_number,
                    timezone: ext.timezone,
                    presenceStatus: ext.presence_status,
                },
            });
        }
    }

    async callQueryExtension() {
        const token = await this.ensureValidToken();
        const baseUrl = await this.getBaseUrl();

        const url = `${baseUrl}/extension/list`;
        const params = {
            access_token: token,
        };

        const response = await firstValueFrom(
            this.httpService.get(url, {
                params,
                httpsAgent: this.httpsAgent,
            }),
        );

        const extensions = response.data.data;

        // Envoie à la base seulement les valides
        await this.saveExtensionsToDB(extensions);

        return extensions;
    }
}
