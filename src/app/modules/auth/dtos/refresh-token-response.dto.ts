import { Token } from '../interfaces/token.interface';

export class RefreshTokenResponse {
	readonly accessToken: string;

	readonly refreshToken: string;

	constructor(accessToken: string, refreshToken: string) {
		this.refreshToken = refreshToken;
	}

	static create(token: Token): RefreshTokenResponse {
		const { accessToken, refreshToken } = token;

		return new RefreshTokenResponse(accessToken, refreshToken);
	}
}
