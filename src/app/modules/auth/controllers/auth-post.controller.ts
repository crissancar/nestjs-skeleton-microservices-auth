import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

import { AuthenticateApiKeyRequest } from '../../api-keys/dtos/authenticate-api-key.request.dto';
import { ApiKeyAuthenticator } from '../../api-keys/services/api-key-authenticator.service';
import { LoggerFactory } from '../../shared/services/logger-factory.service';
import { authConfig } from '../config/auth.config';
import { AuthenticatedUser } from '../dtos/authenticated-user.dto';
import { LoginUserRequest } from '../dtos/login-user-request.dto';
import { JwtCreator } from '../services/jwt-creator.service';
import { Authenticator } from './../services/authenticator.service';

const { globalRoute, postController } = authConfig;
const { context, routes } = postController.constants;
const { login, refresh } = postController.logs;

const logger = LoggerFactory.create(context);

@Controller(globalRoute)
export class AuthPostController {
	constructor(
		private readonly authenticator: Authenticator,
		private readonly apiKeyAuthenticator: ApiKeyAuthenticator,
		private readonly jwtCreator: JwtCreator,
	) {}

	@MessagePattern('local.strategy')
	authenticateUser(@Payload() payload: any): any {
		logger.log('Event local strategy');

		const request = payload.data.attributes as LoginUserRequest;

		return this.authenticator.run(request);
	}

	@MessagePattern('auth.api.key')
	authenticateApiKey(@Payload() payload: any): any {
		logger.log('Event authenticate Api key');

		const request = payload.data.attributes as AuthenticateApiKeyRequest;

		return this.apiKeyAuthenticator.run(request);
	}

	@MessagePattern('auth.create.tokens')
	createTokens(@Payload() payload: any): any {
		logger.log('Event create tokens to authenticated user');

		const authUser = payload.data.attributes as AuthenticatedUser;

		return this.jwtCreator.run(authUser);
	}

	// @RefreshTokenSwagger()
	// @EndpointAuthentication(UserAudiences.ADMIN, UserAudiences.GENERAL)
	// @Post(routes.refreshToken)
	// refreshToken(@AuthUser() authUser: AuthenticatedUser): Token {
	// 	logger.log(refresh.requestLog);

	// 	return this.jwtCreator.run(authUser);
	// }
}
