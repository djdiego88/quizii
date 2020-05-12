import { Component, NgZone } from '@angular/core';
import { LoadingController, ModalController } from '@ionic/angular';
import { LoginModalPage } from './login-modal/login-modal.page';
import { Router } from '@angular/router';
import { Plugins } from '@capacitor/core';
import { ErrorService } from './../../services/error.service';
import { AuthService } from './../../services/auth.service';
const { Toast } = Plugins;

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {

  constructor(
    public loadingController: LoadingController,
    private router: Router,
    private auth: AuthService,
    public modalController: ModalController,
    private error: ErrorService,
    private ngZone: NgZone
  ) { }

  async doFacebookLogin() {
    const loading = await this.loadingController.create({
      message: 'Logging in on Quizii...'
    });
    this.presentLoading(loading);
    try {
      await this.auth.doFacebookAuth(true);
      this.ngZone.run(() => this.router.navigate(['/tabs']));
    } catch (error) {
      console.log(error);
      this.doLogout();
      loading.dismiss();
      if (error.message === 'user_not_registered' || error.message === 'user_disabled') {
        await this.showToast(this.error.getErrorMessage(error.message));
      }
    }
    loading.dismiss();
  }

  async doGoogleLogin() {
    const loading = await this.loadingController.create({
      message: 'Logging in on Quizii...'
    });
    this.presentLoading(loading);
    try {
      await this.auth.doGoogleAuth(true);
      this.ngZone.run(() => this.router.navigate(['/tabs']));
    } catch (error) {
      console.log(error);
      this.doLogout();
      loading.dismiss();
      if (error.message === 'user_not_registered' || error.message === 'user_disabled') {
        await this.showToast(this.error.getErrorMessage(error.message));
      }
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

  async showToast(message: string) {
    await Toast.show({
      text: message,
      duration: 'long'
    });
  }
}
