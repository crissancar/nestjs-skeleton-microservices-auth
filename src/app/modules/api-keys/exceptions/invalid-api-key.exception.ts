import { HttpStatus } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';

import { RpcExceptionData } from '../../shared/interfaces/rpc-exception-data.interface';

export class InvalidApiKeyException extends RpcException {
	constructor(context: string) {
		const message = 'Invalid Api Key';
		const code = HttpStatus.UNAUTHORIZED;
		const exceptionData = { code, message, context } as RpcExceptionData;

		super(exceptionData);
	}
}
