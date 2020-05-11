import { Component } from '@angular/core';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Plugins, AppState } from '@capacitor/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { UserService } from './services/user.service';

const { App } = Plugins;

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private afAuth: AngularFireAuth,
    private user: UserService
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.afAuth.authState.subscribe(user => {
        if (user) {
          App.getState().then(state => {
            this.user.updateUserStatus(user.uid, state.isActive);
          });
          App.addListener('appStateChange', (state: AppState) => {
            this.user.updateUserStatus(user.uid, state.isActive);
          });
        }
      });
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }
}
