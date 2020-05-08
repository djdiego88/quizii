import { UtilitiesService } from './utilities.service';
import { UserService } from './user.service';
import { Injectable, NgZone } from '@angular/core';
import { Platform } from '@ionic/angular';
import { AngularFireAuth } from '@angular/fire/auth';
import * as firebase from 'firebase/app';
import '@firebase/auth';
import { Plugins } from '@capacitor/core';
import { FacebookLoginResponse } from '@rdlabo/capacitor-facebook-login';
import '@codetrix-studio/capacitor-google-auth';
import 'capacitor-secure-storage-plugin';
import { BehaviorSubject } from 'rxjs';
import { User } from '../interfaces/user';
import { first } from 'rxjs/operators';
const { FacebookLogin, GoogleAuth, SecureStoragePlugin  } = Plugins;

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  public loggedIn: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor(
    public auth: AngularFireAuth,
    private platform: Platform,
    private zone: NgZone,
    public user: UserService,
    public utilities: UtilitiesService,
  ) { }

  init(): void {
    // Emit logged in status whenever auth state changes
    firebase.auth().onAuthStateChanged(firebaseUser => {
      this.zone.run(() => {
        firebaseUser ? this.loggedIn.next(true) : this.loggedIn.next(false);
      });
    });
  }

  async doLogin(value): Promise<any> {
    try {
      const userCredential = await this.auth.signInWithEmailAndPassword(value.email, value.password);
      await this.loginUser(userCredential);
      return userCredential;
    } catch (error) {
      throw new Error(error);
    }
    /*return new Promise<any>((resolve, reject) => {
      this.auth.signInWithEmailAndPassword(value.email, value.password)
      .then(
        res => resolve(res),
        err => reject(err));
    });*/
  }

  async doFacebookLogin(): Promise<any> {
    try {
      let userCredential: any;
      if (this.platform.is('hybrid')) {
        userCredential = await this.nativeFacebookAuth();
      } else {
        userCredential = await this.browserFacebookAuth();
      }
      if (userCredential && userCredential instanceof Object && userCredential.user) {
        await this.loginUser(userCredential);
        return userCredential;
      }
    } catch (error) {
      throw new Error(error);
    }
    /*return new Promise<any>((resolve, reject) => {
      if (this.platform.is('hybrid')) {
        this.nativeFacebookAuth()
          .then(result => resolve(result))
          .catch(error => reject(error));
      } else {
        this.browserFacebookAuth()
          .then(result => resolve(result))
          .catch(error => reject(error));
      }
    });*/
  }

  async doGoogleLogin(): Promise<any> {
    try {
      let userCredential: any;
      if (this.platform.is('hybrid')) {
        userCredential = await this.nativeGoogleAuth();
      } else {
        userCredential = await this.browserGoogleAuth();
      }
      if (userCredential && userCredential instanceof Object && userCredential.user) {
        await this.loginUser(userCredential);
        return userCredential;
      }
    } catch (error) {
      throw new Error(error);
    }
    /*return new Promise<any>((resolve, reject) => {
      if (this.platform.is('hybrid')) {
        this.nativeGoogleAuth()
          .then(result => resolve(result))
          .catch(error => reject(error));
      } else {
        this.browserGoogleAuth()
          .then(result => resolve(result))
          .catch(error => reject(error));
      }
    });*/
  }

  /*doRegister(value) {

  }*/

  async doLogout(): Promise<void> {
    const key = 'authProvider';
    if (this.platform.is('hybrid')) {
      try {
        const authProvider = await SecureStoragePlugin.get({ key });
        if (authProvider && authProvider.value === 'facebook') {
          await FacebookLogin.logout(); // Unauth with Facebook
        } else if (authProvider && authProvider.value === 'google') {
          await GoogleAuth.signOut(); // Unauth with Google
        }
        await SecureStoragePlugin.remove({ key });
        await SecureStoragePlugin.remove({ key: 'userInfo' });
        await this.auth.signOut(); // Unauth with Firebase
      } catch (err) {
        console.log(err);
        throw new Error(err);
      }
    } else {
      try {
        await SecureStoragePlugin.remove({ key });
        await SecureStoragePlugin.remove({ key: 'userInfo' });
        await this.auth.signOut();
      } catch (err) {
        throw new Error(err);
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
                  SecureStoragePlugin.set({ key: 'authProvider', value: 'facebook' })
                    .then(success => resolve(response));
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

  async browserFacebookAuth(): Promise<firebase.auth.UserCredential> {
    const provider = new firebase.auth.FacebookAuthProvider();
    const result = await this.auth.signInWithPopup(provider);
    await SecureStoragePlugin.set({ key: 'authProvider', value: 'facebook' });
    return result;
    /*return new Promise((resolve, reject) => {
      const provider = new firebase.auth.FacebookAuthProvider();
      this.auth.signInWithPopup(provider).then(result => {
        SecureStoragePlugin.set({ key: 'authProvider', value: 'facebook' })
          .then(success => resolve(result));
      }).catch(error => {
        console.log(error);
        reject(error);
      });
    });*/
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
                  SecureStoragePlugin.set({ key: 'authProvider', value: 'google' })
                    .then(success => resolve(response));
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

  async browserGoogleAuth(): Promise<firebase.auth.UserCredential> {
    const provider = new firebase.auth.GoogleAuthProvider();
    const result = await this.auth.signInWithPopup(provider);
    await SecureStoragePlugin.set({ key: 'authProvider', value: 'google' });
    return result;
    /*return new Promise((resolve, reject) => {
      const provider = new firebase.auth.GoogleAuthProvider();
      this.auth.signInWithPopup(provider).then(result => {
        SecureStoragePlugin.set({ key: 'authProvider', value: 'google' })
          .then(success => resolve(result));
      }).catch(error => {
        console.log(error);
        reject(error);
      });
    });*/
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

  async loginUser(userCredential: firebase.auth.UserCredential, fields?: any) {
    let user: User;
    if (userCredential.additionalUserInfo.isNewUser) { // Exit if new User
      user = await this.registerUser(userCredential, fields);
    } else {
      user = await this.user.getUser(userCredential.user.uid).pipe(first()).toPromise();
      user.online = true;
      user.lastActiveDate = new Date(userCredential.user.metadata.lastSignInTime).getTime();
      await this.user.updateUser(user);
    }
    if (user.status !== 'enabled') { // The user is disabled
      await this.doLogout();
      throw new Error('user_disabled');
    }
    await SecureStoragePlugin.set({ key: 'userInfo', value: JSON.stringify(user) });
  }

  async registerUser(userCredential: firebase.auth.UserCredential, fields: any) {
    if (!userCredential.additionalUserInfo.isNewUser) { return; } // Exit if old User

    const userLanguage = window.navigator.language.slice(0, 2);
    const appLanguages = this.utilities.getAppLanguages();
    const appLanguage = (!appLanguages.includes(userLanguage)) ? 'en' : userLanguage;

    const authProvider = await SecureStoragePlugin.get({ key: 'authProvider' });
    const randomAvatarId = this.utilities.randomId(30);
    let avatars: any | null = {};
    let avatarFile: Blob | null;
    let displayName: string;

    if (authProvider && authProvider === 'facebook') {
      avatarFile = await this.utilities.downloadFileFromURL(userCredential.user.photoURL + '?height=512&width=512&type=large');
      displayName = userCredential.user.displayName;
    } else if (authProvider && authProvider === 'google') {
      avatarFile = await this.utilities.downloadFileFromURL(userCredential.user.photoURL);
      displayName = userCredential.user.displayName;
    } else {
      avatarFile = null;
      avatars = null;
      displayName = fields.name;
    }

    if (avatarFile) {
      const avatarSizes = this.utilities.getAvatarSizes();
      for (const elem of avatarSizes) {
        const url = await this.utilities.uploadImages(elem, 'users/avatars', randomAvatarId, avatarFile);
        avatars[elem.size] = url;
      }
    }

    const name = await this.utilities.getNamesFromDisplayName(displayName);

    const user: User = {
      avatar: avatars,
      bgImage: null,
      birthday: null,
      city: '',
      country: 'US',
      createdDate: new Date(userCredential.user.metadata.creationTime).getTime(),
      displayName,
      id: userCredential.user.uid,
      language: appLanguage,
      lastActiveDate: new Date(userCredential.user.metadata.lastSignInTime).getTime(),
      level: 1,
      name,
      online: true,
      privateProfile: false,
      showAge: false,
      status: 'enabled',
      title: '',
      totalPoints: 0
    };

    await this.user.createUser(user);

    return user;
  }
}
