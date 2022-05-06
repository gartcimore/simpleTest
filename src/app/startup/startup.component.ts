import {Component, OnInit} from '@angular/core';
import {ChatConfig} from '../contract';
import {Router} from '@angular/router';
import {ActivatedRoute} from '@angular/router';
import {OauthService} from '../oauth.service';

@Component({
  selector: 'app-startup',
  templateUrl: './startup.component.html',
  styleUrls: ['./startup.component.css']
})
export class StartupComponent implements OnInit {

  chatConfig: ChatConfig;
  showAuthConfig: boolean;
  clientId: string;
  discoveryUri: string;

  constructor(private router: Router, private route: ActivatedRoute, private oAuthService: OauthService) {
    this.chatConfig = new ChatConfig();
    this.showAuthConfig = false;
    this.clientId = '';
    this.discoveryUri = '';
  }

  ngOnInit(): void {
    this.chatConfig.genesysJwt = history?.state?.jwt;
    const providedResumeToken = this.route.snapshot.queryParamMap.get('resumeToken');
    if (providedResumeToken) {
      this.chatConfig.setResumeToken(providedResumeToken);
      this.onSubmit();
    }
    if (history?.state?.chatConfig) {
      this.chatConfig = history?.state?.chatConfig;
    }
    console.log(`GenesysJWT is ${this.chatConfig.genesysJwt}`);
  }

  onChange(event: any) {
    let deploymentId = event.target.value;
    if (deploymentId === '22f88f57-e827-47ad-8880-2f870585dd04') {
      this.clientId = '447178411832-38n8bv832i4gqevhk5u3u09tlq1q0afs.apps.googleusercontent.com';
      this.discoveryUri = 'https://accounts.google.com';
    } else if (deploymentId === 'e3d2c863-1f8a-4f30-9f31-ebd0c738cb74') {
      this.clientId = '0oaarvec6M770zRNI5d6';
      //this.discoveryUri = 'https://dev-93779290.okta.com';
      this.discoveryUri = 'https://dev-93779290.okta.com/oauth2/default';
    } else if (deploymentId === 'b8dbcfb4-9e3e-4cf3-a2d2-c458825b4c5d') {
      this.clientId = '0oa1b936uwbcnuvRF5d7';
      this.discoveryUri = 'https://dev-44395699.okta.com';
    } else if (deploymentId === '973a34b4-b50e-4094-98b7-3cd7881694f5') {
      this.clientId = '0oa1itvjk8ElEkp6h5d7';
      this.discoveryUri = 'https://dev-2597597.okta.com';
    } else {
      this.clientId = '';
      this.discoveryUri = '';
    }
  }

  onSubmit(): void {
    this.router.navigate(['/chat'], {state: {data: this.chatConfig}});
  }

  auth(): void {
    console.log(`Auth called!`);
    this.oAuthService.login(this.clientId, this.discoveryUri, this.chatConfig.deploymentID);
    console.log(`Login call finished?!`);
  }

  get config(): string {
    return JSON.stringify(this.chatConfig);
  }
}
