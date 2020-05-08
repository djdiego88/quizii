import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ErrorService {

  constructor() { }

  getErrorMessage(error?: string): string {
    const errors = {
      user_not_registered: 'You are not registered. Please, first create an account.',
      user_disabled: 'You were banned from Quizii. Sorry!',
      user_already_registered: 'You are already registered. Please, signin to your account.',
      max_file_1mb: 'File is too big! Maximum is 1MB.',
      max_file_2mb: 'File is too big! Maximum is 2MB.',
      default: 'Ops, there was an error!'
    };
    return errors[error] || errors.default;
  }
}
