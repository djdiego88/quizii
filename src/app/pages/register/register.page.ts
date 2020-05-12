import { Component, NgZone } from '@angular/core';
import { LoadingController, ModalController } from '@ionic/angular';
import { RegisterModalPage } from './register-modal/register-modal.page';
import { Router } from '@angular/router';
import { Plugins } from '@capacitor/core';
import { ErrorService } from './../../services/error.service';
import { AuthService } from './../../services/auth.service';
const { Toast } = Plugins;

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage {

  constructor(
    public loadingController: LoadingController,
    private router: Router,
    private auth: AuthService,
    public modalController: ModalController,
    private error: ErrorService,
    private ngZone: NgZone
  ) { }

  async doFacebookRegister() {
    const loading = await this.loadingController.create({
      message: 'Signing up on Quizii...'
    });
    this.presentLoading(loading);
    try {
      await this.auth.doFacebookAuth(false);
      this.ngZone.run(() => this.router.navigate(['/tabs']));
    } catch (error) {
      console.log(error);
      this.doLogout();
      loading.dismiss();
      if (error.message === 'user_already_registered' || error.message === 'user_disabled') {
        await this.showToast(this.error.getErrorMessage(error.message));
      }
    }
    loading.dismiss();
  }

  async doGoogleRegister() {
    const loading = await this.loadingController.create({
      message: 'Signing up on Quizii...'
    });
    this.presentLoading(loading);
    try {
      await this.auth.doGoogleAuth(false);
      this.ngZone.run(() => this.router.navigate(['/tabs']));
    } catch (error) {
      console.log(error);
      this.doLogout();
      loading.dismiss();
      if (error.message === 'user_already_registered' || error.message === 'user_disabled') {
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

  async registerModal() {
    const modal = await this.modalController.create({
      component: RegisterModalPage
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
