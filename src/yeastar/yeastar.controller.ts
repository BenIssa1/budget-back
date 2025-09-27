import { Controller, Get, Query } from '@nestjs/common';
import { YeastarService } from './yeastar.service';

@Controller('yeastar')
export class YeastarController {

    constructor(private readonly yeastarService: YeastarService) { }

    @Get('call')
    async callApi() {
        return this.yeastarService.callProtectedApi();
    }

    @Get('extension')
    async callApiExtension() {
        return this.yeastarService.callQueryExtension();
    }
}
