import { Injectable, NgZone } from "@angular/core";
import { Platform } from '@ionic/angular';
import { AngularFireAuth } from '@angular/fire/auth';
import * as firebase from 'firebase/app';
import '@firebase/auth';
import { Plugins } from '@capacitor/core';
import { FacebookLoginResponse } from '@rdlabo/capacitor-facebook-login';
import '@codetrix-studio/capacitor-google-auth';
import { BehaviorSubject } from 'rxjs';
const { FacebookLogin, GoogleAuth  } = Plugins;

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  public loggedIn: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor(
    public auth: AngularFireAuth,
    private platform: Platform,
    private zone: NgZone
  ) { }

  init(): void {
    // Emit logged in status whenever auth state changes
    firebase.auth().onAuthStateChanged(firebaseUser => {
      this.zone.run(() => {
        firebaseUser ? this.loggedIn.next(true) : this.loggedIn.next(false);
      });
    });
  }

  doLogin(value) {
    return new Promise<any>((resolve, reject) => {
      this.auth.signInWithEmailAndPassword(value.email, value.password)
      .then(
        res => resolve(res),
        err => reject(err));
    });
  }

  doFacebookLogin(): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      if (this.platform.is('hybrid')) {
        this.nativeFacebookAuth()
          .then(result => resolve(result))
          .catch(error => reject(error));
      } else {
        this.browserFacebookAuth()
          .then(result => resolve(result))
          .catch(error => reject(error));
      }
    });
  }

  doGoogleLogin(): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      if (this.platform.is('hybrid')) {
        this.nativeGoogleAuth()
          .then(result => resolve(result))
          .catch(error => reject(error));
      } else {
        this.browserGoogleAuth()
          .then(result => resolve(result))
          .catch(error => reject(error));
      }
    });
  }

  /*doRegister(value) {

  }*/

  async doLogout(): Promise<void> {
    if (this.platform.is('hybrid')) {
      try {
        await FacebookLogin.logout(); // Unauth with Facebook
        await this.auth.signOut(); // Unauth with Firebase
      } catch (err) {
        console.log(err);
      }
    } else {
      try {
        await this.auth.signOut();
      } catch (err) {
        console.log(err);
      }
    }
  }

  async nativeFacebookAuth(): Promise<any> {
    return new Promise((resolve, reject) => {
      const FACEBOOK_PERMISSIONS = ['public_profile', 'email'];
      Plugins.FacebookLogin.login({ permissions: FACEBOOK_PERMISSIONS }).then((result: FacebookLoginResponse) => {
        if (result && result.accessToken) {
          // User is signed-in Facebook.
          const unsubscribe = firebase.auth().onAuthStateChanged(firebaseUser => {
            unsubscribe();
            // Check if we are already signed-in Firebase with the correct user.
            if (!this.isUserFacebookEqual(result.accessToken, firebaseUser)) {
              // Build Firebase credential with the Facebook auth token.
              const facebookCredential = firebase.auth.FacebookAuthProvider.credential(result.accessToken.token);
              // Sign in with the credential from the Facebook user.
              this.auth.signInWithCredential(facebookCredential)
                .then(response => {
                  // console.log(response);
                  resolve(response);
                })
                .catch(error => {
                  reject(error);
                });
            } else {
              // User is already signed-in Firebase with the correct user.
              console.log('already signed in');
              resolve();
            }
          });
        } else {
          // User is signed-out of Facebook.
          this.auth.signOut();
        }
      }).catch(error => {
        reject(error);
      });
    });
  }

  async browserFacebookAuth(): Promise<any> {
    return new Promise((resolve, reject) => {
      const provider = new firebase.auth.FacebookAuthProvider();
      this.auth.signInWithPopup(provider).then(result => {
        // console.log(result);
        resolve(result);
      }).catch(error => {
        console.log(error);
        reject(error);
      });
    });
  }

  isUserFacebookEqual(facebookAuthResponse, firebaseUser): boolean {
    if (firebaseUser) {
      const providerData = firebaseUser.providerData;
      providerData.forEach(data => {
        if (
          data.providerId === firebase.auth.FacebookAuthProvider.PROVIDER_ID &&
          data.uid === facebookAuthResponse.userId
        ) {
          // We don't need to re-auth the Firebase connection.
          return true;
        }
      });
    }
    return false;
  }

  async nativeGoogleAuth(): Promise<any> {
    return new Promise((resolve, reject) => {
      //let googleUser = await Plugins.GoogleAuth.signIn();
      //const FACEBOOK_PERMISSIONS = ['public_profile', 'email'];
      Plugins.GoogleAuth.signIn().then(result => {
        if (result && result.authentication.idToken) {
          // User is signed-in Google.
          const unsubscribe = firebase.auth().onAuthStateChanged(firebaseUser => {
            unsubscribe();
            // Check if we are already signed-in Firebase with the correct user.
            if (!this.isUserGoogleEqual(result, firebaseUser)) {
              // Build Firebase credential with the Google auth token.
              const googleCredential = firebase.auth.GoogleAuthProvider.credential(result.authentication.idToken);
              // Sign in with the credential from the Google user.
              this.auth.signInWithCredential(googleCredential)
                .then(response => {
                  // console.log(response);
                  resolve(response);
                })
                .catch(error => {
                  reject(error);
                });
            } else {
              // User is already signed-in Firebase with the correct user.
              console.log('already signed in');
              resolve();
            }
          });
        } else {
          // User is signed-out of Google.
          this.auth.signOut();
        }
      }).catch(error => {
        reject(error);
      });
    });
  }

  async browserGoogleAuth(): Promise<any> {
    return new Promise((resolve, reject) => {
      const provider = new firebase.auth.GoogleAuthProvider();
      this.auth.signInWithPopup(provider).then(result => {
        // console.log(result);
        resolve(result);
      }).catch(error => {
        console.log(error);
        reject(error);
      });
    });
  }

  isUserGoogleEqual(googleAuthResponse, firebaseUser): boolean {
    if (firebaseUser) {
      const providerData = firebaseUser.providerData;
      providerData.forEach(data => {
        if (
          data.providerId === firebase.auth.GoogleAuthProvider.PROVIDER_ID &&
          data.uid === googleAuthResponse.id
        ) {
          // We don't need to re-auth the Firebase connection.
          return true;
        }
      });
    }
    return false;
  }
}
