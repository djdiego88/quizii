import { Component } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  constructor(
    private auth: AuthService,
    private router: Router,
  ) {}

  doLogout() {
    this.auth.doLogout().then(result => {
      console.log('logout');
      this.router.navigate(['/login']);
    })
    .catch(err => {
      console.log(err);
    });
  }

}
