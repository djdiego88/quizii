import { AuthService } from './../../services/auth.service';
import { Component, OnInit } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  constructor(
    public loadingController: LoadingController,
    private router: Router,
    private auth: AuthService,
  ) { }

  ngOnInit() {
  }

  async doFacebookLogin() {
    const loading = await this.loadingController.create({
      message: 'Please wait...'
    });
    this.presentLoading(loading);
    this.auth.doFacebookLogin().then(userCredential => {
      console.log(userCredential);
      loading.dismiss();
    });
  }

  doLogout() {
    this.auth.doLogout().then(result => {
      console.log('logout');
    })
    .catch(err => {
      console.log(err);
    });
  }

  async presentLoading(loading) {
    return await loading.present();
  }

}
