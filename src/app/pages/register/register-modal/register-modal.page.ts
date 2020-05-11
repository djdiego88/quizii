import { Component, OnInit, ViewChild, NgZone } from '@angular/core';
import { LoadingController, ModalController } from '@ionic/angular';
import { Validators, FormBuilder, FormGroup, FormControl, AbstractControl, ValidationErrors, FormGroupDirective } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';
import { ErrorService } from './../../../services/error.service';
import { UtilitiesService } from './../../../services/utilities.service';
import { PhotoService } from './../../../services/photo.service';
import { DomSanitizer } from '@angular/platform-browser';
import { Plugins } from '@capacitor/core';
const { Toast } = Plugins;


@Component({
  selector: 'app-register-modal',
  templateUrl: './register-modal.page.html',
  styleUrls: ['./register-modal.page.scss'],
})
export class RegisterModalPage implements OnInit {

  @ViewChild('registerFormRef')
    registerFormRef: FormGroupDirective;

  registerForm: FormGroup;
  errorMessage: string = '';
  avatarImg: any;
  avatar: any = null;
  loading: boolean = false;

  registerMessages = {
    email: [
      { type: 'required', message: 'Email is required.' },
      { type: 'email', message: 'Please enter a valid email.' },
    ],
    password: [
      { type: 'required', message: 'Password is required.' },
      { type: 'minlength', message: 'Password must be at least 5 characters long.' }
    ],
    name: [
      { type: 'required', message: 'Display Name is required.' },
      { type: 'minlength', message: 'Display Name must be at least 5 characters long.' }
    ]
  };

  constructor(
    public modalController: ModalController,
    private authService: AuthService,
    private formBuilder: FormBuilder,
    private router: Router,
    private error: ErrorService,
    private utilities: UtilitiesService,
    private photo: PhotoService,
    private sanitizer: DomSanitizer,
    public loadingController: LoadingController,
    private ngZone: NgZone
  ) { }

  ngOnInit() {
    this.registerForm = this.formBuilder.group({
      email: new FormControl('', Validators.compose([
        Validators.required,
        Validators.email,
      ])),
      password: new FormControl('', Validators.compose([
        Validators.minLength(5),
        Validators.required
      ])),
      name: new FormControl('', Validators.compose([
        Validators.minLength(5),
        Validators.required
      ])),
    });
  }

  sendForm() {
    this.registerFormRef.onSubmit(undefined);
  }

  async tryRegister(value) {
    const loading = await this.loadingController.create({
      message: 'Signing up on Quizii...'
    });
    this.presentLoading(loading);
    value.avatar = this.avatar;
    await this.authService.doRegister(value)
    .then(userCredential => {
      this.ngZone.run(() => this.router.navigate(['/home']));
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

  closeRegister() {
    this.modalController.dismiss();
  }

  async uploadAvatar() {
    const imagePath = await this.photo.getPhotoPath();
    const safeImagePath = this.sanitizer.bypassSecurityTrustUrl(imagePath);
    this.loading = false;
    this.avatarImg = safeImagePath;
    this.avatar = imagePath;
  }

  async showToast(message: string) {
    await Toast.show({
      text: message,
      duration: 'long'
    });
  }

  async presentLoading(loading) {
    return await loading.present();
  }
}
