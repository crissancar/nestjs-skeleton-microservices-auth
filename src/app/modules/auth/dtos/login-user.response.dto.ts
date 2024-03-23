import { Token } from '../interfaces/token.interface';

export class LoginUserResponse {
	readonly accessToken: string;

	readonly refreshToken: string;

	constructor(accessToken: string, refreshToken: string) {
		this.refreshToken = refreshToken;
	}

	static create(token: Token): LoginUserResponse {
		const { accessToken, refreshToken } = token;

		return new LoginUserResponse(accessToken, refreshToken);
	}
}
