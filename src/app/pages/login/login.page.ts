import { Component, OnInit } from '@angular/core';
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
export class LoginPage implements OnInit {

  constructor(
    public loadingController: LoadingController,
    private router: Router,
    private auth: AuthService,
    public modalController: ModalController,
    private error: ErrorService
  ) { }

  ngOnInit() {
  }

  async doFacebookLogin() {
    const loading = await this.loadingController.create({
      message: 'Logging in on Quizii...'
    });
    this.presentLoading(loading);
    try {
      const userCredential = await this.auth.doFacebookAuth(true);
      console.log(userCredential);
      //this.router.navigate(['/home']);
    } catch (error) {
      console.log(error);
      this.doLogout();
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
      const userCredential = await this.auth.doGoogleAuth(true);
      console.log(userCredential);
      //this.router.navigate(['/home']);
    } catch (error) {
      console.log(error);
      this.doLogout();
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
