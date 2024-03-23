import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout } from 'rxjs';

import { CheckBlacklistUserRequest } from '../../blacklists/user/dtos/check-blacklist-user-request.dto';
import { BlacklistUserChecker } from '../../blacklists/user/services/blacklist-user-checker.service';
import { Bcrypt } from '../../shared/services/bcrypt.service';
import { LoggerFactory } from '../../shared/services/logger-factory.service';
import { BaseMessage } from '../../shared/services/message-factory.service';
import { Uuid } from '../../shared/services/uuid.service';
import { authConfig } from '../config/auth.config';
import { AuthenticatedUser } from '../dtos/authenticated-user.dto';
import { LoginUserRequest } from '../dtos/login-user-request.dto';
import { InvalidCredentialsException } from '../exceptions/invalid-credentials.exception';

const { authenticator } = authConfig;
const { context } = authenticator.constants;

const logger = LoggerFactory.create('Authenticator');

@Injectable()
export class Authenticator {
	constructor(
		@Inject('CLIENT_FIND_USER_FOR_AUTHENTICATION') private readonly userProxy: ClientProxy,
		private readonly blacklistUserChecker: BlacklistUserChecker,
	) {}

	async run(request: LoginUserRequest): Promise<AuthenticatedUser> {
		const user = await this.getUser(request.email);

		// await this.checkUserBlocked(user);

		this.checkUserAuthentication(request, user);

		return AuthenticatedUser.create(user);
	}

	private async getUser(email: string): Promise<any> {
		// const request = FindUserByEmailRequest.create(email);
		const request = { email };

		// return this.userFinder.run(request);
		const message: BaseMessage = {
			data: {
				id: Uuid.random(),
				type: 'user.find.for.authentication',
				occurredOn: new Date(),
				attributes: { request },
				meta: {
					correlation: Uuid.random(),
					idempotency: Uuid.random(),
				},
			},
		};

		try {
			const foundUser$ = this.userProxy
				.send<any>('user.find.for.authentication', message)
				.pipe(timeout(10000));

			return await firstValueFrom(foundUser$);
		} catch (error) {
			logger.error(error);
			throw new BadRequestException();
		}
	}

	private async checkUserBlocked(user: any): Promise<void> {
		const request = CheckBlacklistUserRequest.create(user.id);

		await this.blacklistUserChecker.run(request);
	}

	private checkUserAuthentication(request: LoginUserRequest, user: any): void {
		const { password: requestPassword } = request;
		const { password: userPassword } = user;

		// if (!UserEntity.comparePasswords(requestPassword, userPassword)) {
		// 	throw new InvalidCredentialsException(context);
		// }
		logger.debug({
			requestPassword,
			userPassword,
			compare: Bcrypt.compare(requestPassword, userPassword),
		});

		if (!Bcrypt.compare(requestPassword, userPassword)) {
			throw new InvalidCredentialsException(context);
		}
	}
}
