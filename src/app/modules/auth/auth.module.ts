import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ClientProviderOptions, ClientsModule, Transport } from '@nestjs/microservices';

import { ApiKeysModule } from '../api-keys/api-keys.module';
import { BlacklistsModule } from '../blacklists/blacklists.module';
import { jwtConfig } from './config/jwt.config';
import { AuthPostController } from './controllers/auth-post.controller';
import { Authenticator } from './services/authenticator.service';
import { JwtCreator } from './services/jwt-creator.service';

function clientFactory(name: string, queue: string): ClientProviderOptions {
	return {
		name,
		transport: Transport.RMQ,
		options: {
			urls: ['amqps://qagxqjke:XuoOJiC3RCN2C0E_oNuEWv1KZ6y4NGem@rat.rmq2.cloudamqp.com/qagxqjke'],
			queue,
			queueOptions: {
				durable: false,
			},
		},
	};
}

@Module({
	imports: [
		JwtModule.register(jwtConfig),
		ClientsModule.register([
			clientFactory('CLIENT_FIND_USER_BY_EMAIL', 'find_user_by_email_queue'),
			clientFactory('CLIENT_FIND_USER_FOR_AUTHENTICATION', 'find_user_for_authentication_queue'),
		]),
		ApiKeysModule,
		// PassportModule,
		BlacklistsModule,
	],
	controllers: [AuthPostController],
	providers: [Authenticator, JwtCreator],
	exports: [JwtCreator],
})
export class AuthModule {}
