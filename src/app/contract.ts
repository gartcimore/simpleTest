import {v4 as uuidv4} from 'uuid';
import MD5 from "crypto-js/md5";

export class ChatConfig {
  deploymentID: string;
  wssUri: string;
  token: string;
  hashedToken: string;
  genesysJwt: string | undefined;
  resumeToken: string | undefined;

  constructor() {
    this.deploymentID = '0d1a65a6-be58-49ad-81b0-d9ed15f6969e';
    this.wssUri = 'wss://webmessaging.inindca.com/v1';
    this.token = uuidv4();
    this.hashedToken = MD5('GCPII[' + this.token + ']').toString().toUpperCase();
    console.log('Hashed token: ' + this.hashedToken);
  }

  setToken(token: string) {
    this.token = token;
    this.hashedToken = MD5('GCPII[' + this.token + ']').toString().toUpperCase();
    console.log('Hashed token: ' + this.hashedToken);
  }

  setResumeToken(providedResumeToken: string) {
    this.resumeToken = providedResumeToken;
  }
}

export enum RequestType {
  ConfigureSession = 'configureSession',
  //ConfigureSessionAuthenticated = 'configureSessionAuthenticated',
  ConfigureSessionAuthenticated = 'configureAuthenticatedSession',
  GenerateUploadUrl = 'onAttachment',
  GenerateDownloadUrl = 'getAttachment',
  DeleteAttachment = 'deleteAttachment',
  IncomingMessage = 'onMessage',
  CloseSession = 'closeSession',
  EchoMessage = 'echo',
  GetJwt = 'getJwt',
  DisconnectCustomer = 'disconnectCustomer',
  ResumeToken = 'resumeToken',
}

export enum ResponseClass {
  SessionResponse = 'SessionResponse',
  StructuredMessage = 'StructuredMessage'
}

export interface BaseResponse {
  type: string;
  class: ResponseClass;
  code: number;
  body: NormalizedMessage | ConfigureSessionResponseBody;
}

export interface BaseRequest {
  action: RequestType;
}

export class ConfigureSessionRequest implements BaseRequest {
  action = RequestType.ConfigureSession;
  deploymentId: string | undefined;
  token: string | undefined;
  resumeToken: string | undefined;
  //TODO:MF:2021-08-02:Add Journey context back!, e.g., journeyContext?: JourneyContext;
}

export class ConfigureSessionAuthenticatedRequest implements BaseRequest {
  action = RequestType.ConfigureSessionAuthenticated;
  deploymentId: string;
  token: string;
  data: oAuthParams;

  constructor(deploymentId: string, token: string, data: oAuthParams) {
    this.deploymentId = deploymentId;
    this.token = token;
    this.data = data;
  }
}

export class oAuthParams {
  code: string;

  constructor(code: string) {
    this.code = code;
  }
}

export class CloseSessionRequest implements BaseRequest {
  action = RequestType.CloseSession;
  token: string;

  constructor(token: string) {
    this.token = token;
  }
}

export interface ConfigureSessionResponseBody {
  connected: boolean;
  newSession: boolean;
  token?: string;
}

export interface ConfigureSessionResponse {
  type: "response";
  class: ResponseClass.SessionResponse;
  code: number;
  body: ConfigureSessionResponseBody;
}

export class DisconnectRequest implements BaseRequest {
  action = RequestType.DisconnectCustomer;
  token: string | undefined
}

export class SendMessageRequest implements BaseRequest {
  action = RequestType.IncomingMessage;
  token: string | undefined;
  time: string | undefined;
  message: NormalizedMessage | undefined;
}

export class ResumeTokenRequest implements BaseRequest {
  action = RequestType.ResumeToken;
  token: string;
  resumeToken: string;
  deploymentId: string; // fixme remove

  constructor(token: string, resumeToken: string, deploymentId: string) {
    this.token = token;
    this.resumeToken = resumeToken;
    this.deploymentId = deploymentId;
  }

}

export enum Direction {
  Inbound = 'Inbound',
  Outbound = 'Outbound'
}

export class NormalizedMessage {
  type: string;
  text: string;
  id: string;
  direction: Direction;
  // content: MessageContent[];
  metadata?: { [key: string]: string };

  constructor(type: string, text: string, id: string, direction: Direction) {
    this.type = type;
    this.text = text;
    this.id = id;
    this.direction = direction;
  }
}

export class JwtExchangeRequest {
  deploymentId: string;
  oauth: Oauth;

  constructor(deploymentId: string, oauth: Oauth) {
    this.deploymentId = deploymentId;
    this.oauth = oauth;
  }

}

export class Oauth {
  code: string;
  redirectUri: string;
  nonce: string | undefined;
  maxAge: number | undefined;

  constructor(code: string, redirectUri: string) {
    this.code = code;
    this.redirectUri = redirectUri;
  }

}

