import { AuthService } from './../../services/auth.service';
import { Component, OnInit } from '@angular/core';
import { LoadingController, ModalController } from '@ionic/angular';
import { LoginModalPage } from './login-modal/login-modal.page';
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
    public modalController: ModalController
  ) { }

  ngOnInit() {
  }

  async doFacebookLogin() {
    const loading = await this.loadingController.create({
      message: 'Please wait...'
    });
    this.presentLoading(loading);
    try {
      const userCredential = await this.auth.doFacebookLogin();
      console.log(userCredential);
    } catch (error) {
      console.log(error);
    }
    loading.dismiss();
  }

  async doGoogleLogin() {
    const loading = await this.loadingController.create({
      message: 'Please wait...'
    });
    this.presentLoading(loading);
    try {
      const userCredential = await this.auth.doGoogleLogin();
      console.log(userCredential);
    } catch (error) {
      console.log(error);
    }
    loading.dismiss();
  }

  doLogout() {
    this.auth.doLogout().then(result => {
      console.log('logout');
    })
    .catch(err => {
      console.log(err);
    });
  }

  async loginModal() {
    const modal = await this.modalController.create({
      component: LoginModalPage
    });
    return await modal.present();
  }

  async presentLoading(loading) {
    return await loading.present();
  }

}
