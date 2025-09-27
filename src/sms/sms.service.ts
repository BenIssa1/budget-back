import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SmsService {
  constructor(
    private readonly configService: ConfigService,
  ) { }

  private async getToken(clientID: string, clientSecret: string) {
    const auth = Buffer.from(`${clientID}:${clientSecret}`).toString('base64');
    const data = await fetch('https://api.orange.com/oauth/v3/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body: 'grant_type=client_credentials'
    }).then(response => response.json())
    return data['access_token'];
  }

  async sendResetPassword(number: string, message: string) {
    const token = await this.getToken(this.configService.get('clientId'), this.configService.get('clientSecret'));
    
     const data = await fetch(`https://api.orange.com/smsmessaging/v1/outbound/tel:+${this.configService.get('senderAdress')}/requests`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        "outboundSMSMessageRequest": {
          "address": `tel:+225${number}`,
          "senderAddress": `tel:+${this.configService.get('senderAdress')}`,
          "outboundSMSTextMessage": {
            "message": message
          }
        }
      })
    })
      .then(response => response.json());
  
    return data;  
  }
}
