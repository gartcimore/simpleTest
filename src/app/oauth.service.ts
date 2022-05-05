import { Injectable } from '@angular/core';
import { OAuthService, AuthConfig } from 'angular-oauth2-oidc';

@Injectable({
  providedIn: 'root'
})
export class OauthService {

  constructor(private oauthService: OAuthService) { }

  public login(clientID: string, discoveryUri: string, deploymentId: string): void {
    console.log(`clientID ${clientID} discoveryUri ${discoveryUri}`);
    const host = location.host;
    const authCodeFlowConfig: AuthConfig = {
      issuer: discoveryUri,
      clientId: clientID,
      responseType: 'code',
      redirectUri: `http://${host}/auth/callback`,
      scope: 'openid profile email',
      showDebugInformation: true,
      disablePKCE: true,
      requireHttps: false,
      nonceStateSeparator : '--',
      strictDiscoveryDocumentValidation: false
    };
    console.log(`authCodeFlowConfig ${authCodeFlowConfig}`);
    this.initCodeFlow(authCodeFlowConfig, deploymentId);
  }

  private initCodeFlow(authCodeFlowConfig: any, deploymentId: string): void {
    console.log(`Starting code flow`);
    this.oauthService.configure(authCodeFlowConfig);
    this.oauthService.initCodeFlow(deploymentId);
    this.oauthService.loadDiscoveryDocumentAndTryLogin();
    console.log(`initCodeFlow complete`);
  }
}
