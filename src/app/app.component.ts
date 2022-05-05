import { Component, OnInit } from '@angular/core';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'standalone-messenger';

  ngOnInit(): void {
    // const genesysJwt = this.route.snapshot.queryParams.genesysJwt;
    console.log(`Hello World!`);
  }
}
