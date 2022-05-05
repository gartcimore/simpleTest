import {Injectable} from '@angular/core';
import {
  BaseResponse,
  ChatConfig,
  CloseSessionRequest,
  ConfigureSessionAuthenticatedRequest,
  ConfigureSessionRequest,
  Direction,
  DisconnectRequest,
  NormalizedMessage,
  oAuthParams,
  RequestType,
  SendMessageRequest, ResumeTokenRequest, ConfigureSessionResponseBody
} from './contract';

import {webSocket, WebSocketSubject} from 'rxjs/webSocket';
import {ChatComponent} from './chat/chat.component';
import {v4 as uuidv4} from 'uuid';

@Injectable({
  providedIn: 'root'
})
export class ShyrkaService {

  chatComponent: ChatComponent | undefined;
  chatConfig: ChatConfig;
  private socket$: WebSocketSubject<any> | undefined;
  private sentDisconnect: boolean = false;

  constructor() {
    this.chatConfig = new ChatConfig();
  }

  connect(chatConfig: ChatConfig, chatComponent: ChatComponent): void {
    this.chatComponent = chatComponent;
    this.chatConfig = chatConfig;
    if (!this.socket$ || this.socket$.closed) {
      this.socket$ = this.getNewWebSocket();
      this.socket$.subscribe(
        (message) => this.handleMessage(message, chatComponent, chatConfig),
        (err) => console.error(err),
        () => console.warn('Completed!')
      );
    }
  }

  configureSession(): void {
    if (this.chatConfig.genesysJwt) {
      console.log(`Configuring Authenticated Session`);
      this.configureAuthenticatedSession();
    } else {
      console.log(`Configuring NORMAL session`);
      this.configureStandardSession();
    }
  }

  private configureAuthenticatedSession(): void {
    if (!this.socket$) {
      return;
    }
    if (!this.chatConfig.genesysJwt) {
      console.log(`Unable to configure authenticated session Genesys JWT is absent`);
      return;
    }
    console.log(`Configuring Authenticated Session`);
    const authData = new oAuthParams(this.chatConfig.genesysJwt);
    const configureSession = new ConfigureSessionAuthenticatedRequest(this.chatConfig.deploymentID, this.chatConfig.token, authData);
    const messageToSend = JSON.stringify(configureSession);
    console.log(`Sending auth configure payload ${messageToSend}`);
    this.socket$.next(configureSession);
  }

  private configureStandardSession(): void {
    if (!this.socket$) {
      return;
    }
    console.log(`Configuring Session`);
    const configureSession = new ConfigureSessionRequest();
    configureSession.action = RequestType.ConfigureSession;
    configureSession.deploymentId = this.chatConfig.deploymentID;
    configureSession.token = this.chatConfig.token;
    if (this.chatConfig.resumeToken) {
      configureSession.resumeToken = this.chatConfig.resumeToken;
    }
    const messageToSend = JSON.stringify(configureSession);
    console.log(`Sending configure payload ${messageToSend}`);
    this.socket$.next(configureSession);
  }

  send(message: string, messageId: string): void {
    if (!this.socket$) {
      console.log(`Websocket not setup! Returning without any action taken!`);
      return;
    }
    const sendMessageRequest = new SendMessageRequest();
    sendMessageRequest.action = RequestType.IncomingMessage;

    const messageBody = new NormalizedMessage('Text', message, messageId, Direction.Outbound);
    messageBody.metadata = {};
    messageBody.metadata['clientId'] = messageId;
    sendMessageRequest.message = messageBody;
    sendMessageRequest.token = this.chatConfig.token;
    this.socket$.next(sendMessageRequest);
  }

  sendDisconnect(): void {
    if (!this.socket$) {
      console.log(`Websocket not setup! Returning without any action taken!`);
      return;
    }

    const disconnectRequest = new DisconnectRequest();
    disconnectRequest.token = this.chatConfig.token;
    disconnectRequest.action = RequestType.DisconnectCustomer;
    this.sentDisconnect = true;
    this.socket$.next(disconnectRequest);
  }

  close(): void {
    if (!this.socket$) {
      console.log(`Websocket not setup. Returning without action`);
      return;
    }
    if (this.sentDisconnect) {
      console.log(`Disconnect sent. Not closing via closesssionrequest`);
      return;
    }
    const closeSessionRequest = new CloseSessionRequest(this.chatConfig.token);
    this.socket$.next(closeSessionRequest);
    this.socket$.complete();
  }

  private getNewWebSocket(): WebSocketSubject<any> {
    const connectionUrl = this.chatConfig.wssUri + '?deploymentId=' + this.chatConfig.deploymentID;
    console.log(`Connecting to ${connectionUrl}`);

    return webSocket({
      url: connectionUrl,
      openObserver: {
        next: () => {
          console.log(`Websocket opened...`);
          this.configureSession();
        }
      },
      closeObserver: {
        next: () => {
          console.log(`Websocket Closed! :(`);
        }
      },
    });
  }

  handleMessage(message: string, chatComponent: ChatComponent, chatConfig: ChatConfig): void {
    const inboundMessage = JSON.stringify(message);

    const msg: BaseResponse = JSON.parse(inboundMessage);
    if (msg.type === 'message' && msg.class === 'StructuredMessage') {
      const structuredMessage = msg.body as NormalizedMessage;
      if (structuredMessage.direction === Direction.Outbound) {
        chatComponent.handleAgentMessage(structuredMessage);
      } else if (structuredMessage.direction === Direction.Inbound) {
        chatComponent.handleCustomerMessage(structuredMessage);
      }
    }

    if (msg.type === 'response' && msg.class === 'SessionResponse') {
      console.log(`Got configure session response`);
      if (msg.code == 200) {
        chatComponent.setSessionState(true);
        this.send(' ', uuidv4());
        const configureSessionResponseBody = msg.body as ConfigureSessionResponseBody;
        if (configureSessionResponseBody?.token) {
          console.log(`Got token in response from using resume token`);
          chatConfig.setToken(configureSessionResponseBody.token);
        }
      } else {
        chatComponent.setSessionState(false);
      }
    }
  }

  registerResumeToken(resumeToken: string): void {
    if (!this.socket$) {
      console.log(`Websocket not setup! Returning without any action taken!`);
      return;
    }

    const resumeTokenRequest = new ResumeTokenRequest(this.chatConfig.token, resumeToken, this.chatConfig.deploymentID);

    this.socket$.next(resumeTokenRequest);
  }
}
