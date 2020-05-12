import { Component, OnInit, ViewChild, NgZone } from '@angular/core';
import { LoadingController, ModalController } from '@ionic/angular';
import { Validators, FormBuilder, FormGroup, FormControl, AbstractControl, ValidationErrors, FormGroupDirective } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';
import { ErrorService } from './../../../services/error.service';

@Component({
  selector: 'app-login-modal',
  templateUrl: './login-modal.page.html',
  styleUrls: ['./login-modal.page.scss'],
})
export class LoginModalPage implements OnInit {

  @ViewChild('loginFormRef')
    loginFormRef: FormGroupDirective;

  loginForm: FormGroup;
  errorMessage: string = '';

  loginMessages = {
    email: [
      { type: 'required', message: 'Email is required.' },
      { type: 'email', message: 'Please enter a valid email.' },
    ],
    password: [
      { type: 'required', message: 'Password is required.' },
      { type: 'minlength', message: 'Password must be at least 5 characters long.' }
    ]
  };

  constructor(
    public modalController: ModalController,
    private authService: AuthService,
    private formBuilder: FormBuilder,
    private router: Router,
    private error: ErrorService,
    public loadingController: LoadingController,
    private ngZone: NgZone
  ) { }

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      email: new FormControl('', Validators.compose([
        Validators.required,
        Validators.email,
      ])),
      password: new FormControl('', Validators.compose([
        Validators.minLength(5),
        Validators.required
      ])),
    });
  }

  sendForm() {
    this.loginFormRef.onSubmit(undefined);
  }

  async tryLogin(value) {
    const loading = await this.loadingController.create({
      message: 'Logging in on Quizii...'
    });
    this.presentLoading(loading);
    await this.authService.doLogin(value)
    .then(userCredential => {
      this.ngZone.run(() => this.router.navigate(['/tabs']));
    }, err => {
      if (err.message === 'user_disabled') {
        this.errorMessage = this.error.getErrorMessage(err.message);
      } else {
        this.errorMessage = err.message;
      }
      console.log(err);
      loading.dismiss();
    });
    loading.dismiss();
  }

  closeLogin() {
    this.modalController.dismiss();
  }

  async presentLoading(loading) {
    return await loading.present();
  }
}
