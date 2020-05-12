import { Component, OnInit, NgZone } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';
import { Plugins, StatusBarStyle } from '@capacitor/core';

const { StatusBar } = Plugins;

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {

  constructor(
    private auth: AuthService,
    private router: Router,
    private ngZone: NgZone
  ) { }

  ngOnInit() {
    StatusBar.setStyle({
      style: StatusBarStyle.Dark
    });
    StatusBar.setBackgroundColor({ color: '#46178f'});
  }

  doLogout() {
    this.auth.doLogout().then(result => {
      console.log('logout');
      this.ngZone.run(() => this.router.navigate(['/login']));
    })
    .catch(err => {
      console.log(err);
    });
  }

}
