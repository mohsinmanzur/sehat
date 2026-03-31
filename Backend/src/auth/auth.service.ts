import { Inject, Injectable } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import refreshConfig from '../auth/config/refresh.config';

@Injectable()
export class AuthService
{
    constructor(
        private readonly jwtService: JwtService,
        @Inject(refreshConfig.KEY) private refreshTokenConfig: ConfigType<typeof refreshConfig>
    ) {}

    async signTokens(id: string)
    {
        return {
            id,
            jwtToken: this.jwtService.sign({ sub: id }),
            refreshToken: this.jwtService.sign({ sub: id }, this.refreshTokenConfig),
        };
    }

    refresh(id: string)
    {
        let payload = { sub: id };

        let jwt = this.jwtService.sign(payload);

        return { id, jwt };
    }
}