import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, NonNullableFormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { initializeApp } from "firebase/app";
import { Router } from '@angular/router';
import { confirmPasswordReset, getAuth, sendPasswordResetEmail, verifyPasswordResetCode } from 'firebase/auth';
import { getFirestore, collection, onSnapshot, query, getDocs } from 'firebase/firestore';
import { CustomValidators } from '../models/custom-validators';
import { PassForm } from '../models/pass-form.model';
import { MatFormFieldModule } from '@angular/material/form-field';
import { RouterModule } from '@angular/router';

const firebaseConfig = {
  apiKey: "AIzaSyAmHLlg6nksAWT9uyaNO4O9qk9Tsq0dC4A",
  authDomain: "dabubble-2a0d1.firebaseapp.com",
  projectId: "dabubble-2a0d1",
  storageBucket: "dabubble-2a0d1.appspot.com",
  messagingSenderId: "715027715963",
  appId: "1:715027715963:web:556dd9e26663825eee0fde"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

@Component({
  selector: 'app-password-reset',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, RouterModule],
  templateUrl: './password-reset.component.html',
  styleUrls: ['./password-reset.component.scss', './password-reset.responsive.scss']
})

export class PasswordResetComponent implements OnInit {
  showAlert: boolean = false;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private pwfb: NonNullableFormBuilder
  ) { }

  ngOnInit(): void {
    document.addEventListener('DOMContentLoaded', () => {
      this.mode = this.getParameterByName('mode');
      this.authCode = this.getParameterByName('oobCode');
      this.switchView();
    });
    this.passwordResetForm = this.pwfb.group(
      {
        password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(100)]],
        confirmPassword: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(100)]]
      },
      {
        validators: CustomValidators.passwordsMatching,
      }
    )

    this.getScreenHeight = window.innerHeight;

    if (this.getScreenHeight <= 951) {
      this.addTheUpperMargin = true;
    } else if (this.getScreenHeight > 951) {
      this.addTheUpperMargin = false;
    }
  }

  @HostListener('window:resize', ['$event'])
  onWindowResize() {
    this.getScreenHeight = window.innerHeight;

    if (this.getScreenHeight <= 951) {
      this.addTheUpperMargin = true;
    } else if (this.getScreenHeight > 951) {
      this.addTheUpperMargin = false;
    }
  }
  passwordResetForm!: FormGroup<PassForm>;
  auth = getAuth(app);
  mode: string = '';
  authCode: string = '';
  first: boolean = true;
  second: boolean = false;
  emailSent: boolean = false;
  passwordChanged: boolean = false;
  sendEmailBtnDisabled: boolean = false;
  resetPWBtnDisabled: boolean = false;
  showEmailErrorDiv: boolean = false;
  showPasswordErrorDiv: boolean = false;
  showConfirmPasswordErrorDiv: boolean = false;
  isText1: boolean = false;
  isText2: boolean = false;
  type1: string = 'password';
  type2: string = 'password';
  public getScreenWidth: any;
  public getScreenHeight: any;
  addTheUpperMargin: boolean = false;

  emailForPasswordResetForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  getParameterByName(name) {
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regexS = "[\\?&]" + name + "=([^&#]*)";
    var regex = new RegExp(regexS);
    var results = regex.exec(window.location.href);
    if (results == null)
      return "";
    else
      return decodeURIComponent(results[1].replace(/\+/g, " "));
  }

  switchView() {
    if (this.mode === "resetPassword") {
      this.second = true;
      this.first = false;
    } else {
      this.second = false;
      this.first = true;
    }
  }

  goBackToLogin() {
    this.router.navigateByUrl('login');
  }

  async sendEmail() {
    let userEmailExists = this.emailForPasswordResetForm.value.email; 
    let userEmails = [];

    const q = query(collection(db, 'users'));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      if(userEmailExists == doc.data()['email']) {
        userEmails.push(doc.data()['email']);
      }
    });

/*     const q = query(collection(db, 'users'));
    onSnapshot(q, (list) => {
      list.forEach(element => {
        if(userEmailExists == element.data()['email']) {
          userEmails.push(element.data()['email']);
        }
      });
    }); */

    if(userEmails.length == 0) {
      this.showFalseLoginAlert();
    } else {
      await sendPasswordResetEmail(this.auth, this.emailForPasswordResetForm.value.email).then(async () => {
        this.sendEmailBtnDisabled = true;
        this.emailSent = true;
        setTimeout(() => {
          this.emailSent = false;
          this.sendEmailBtnDisabled = false;
          this.goBackToLogin();
        }, 1500);
      });
    };
    userEmails = [];

/*     await sendPasswordResetEmail(this.auth, this.emailForPasswordResetForm.value.email).then(async () => {
      this.sendEmailBtnDisabled = true;
      this.emailSent = true;
      setTimeout(() => {
        this.emailSent = false;
        this.sendEmailBtnDisabled = false;
        this.goBackToLogin();
      }, 1500);
    }).catch((error) => {
      console.log("USER EXISTIERT NICHT");
      this.showFalseLoginAlert();
    }); */
  }

  checkPasswordErrors(control: string) {
    const errors = (this.passwordResetForm.controls as any)[control].errors;
    return this.getPWErrorMessage(errors);
  }

  checkEmailErrors(control: string) {
    const errors = (this.emailForPasswordResetForm.controls as any)[control].errors;
    return this.getEmailErrorMessage(errors);
  }

  getPWErrorMessage(errors: ValidationErrors) {
    if (errors['required']) {
      return 'Bitte geben Sie einen Passwort ein';;
    } else if (errors['minlength']) {
      return 'Das Passwort muss länger als 8 Zeichen sein';
    } else if (errors['maxlength']) {
      return "Das Passwort darf nicht länger als 100 Zeichen sein";
    } else {
      return
    }
  }

  getEmailErrorMessage(errors: ValidationErrors) {
    if (errors['required']) {
      return 'Bitte geben Sie Ihre E-Mail-Adresse ein'
    } else if (errors['pattern']) {
      return 'Keine gültige E-Mail-Adresse'
    } else if (errors['email']) {
      return
    }
  }

  showFalseLoginAlert() {
    this.showAlert = true;
    setTimeout(() => {
      this.emailForPasswordResetForm.reset();
      this.showAlert = false;
    }, 3000);
  }

  resetPassword() {
    this.handleResetPassword(this.auth, this.authCode);
  }

  handleResetPassword(auth, actionCode) {
    verifyPasswordResetCode(auth, actionCode).then(() => {
      const newPassword = this.passwordResetForm.value.confirmPassword;
      confirmPasswordReset(auth, actionCode, newPassword).then(() => {
        // console.log("password changed successfully")
        this.passwordChanged = true;
        setTimeout(() => {
          this.passwordChanged = false;
          this.goBackToLogin();
        }, 2000);
      }).catch((error) => {
        console.log(error.message)
      })
    })
  }

  togglePassword1Visibility() {
    this.isText1 = !this.isText1
    this.type1 = this.isText1 ? "text" : "password";
  }

  togglePassword2Visibility() {
    this.isText2 = !this.isText2
    this.type2 = this.isText2 ? "text" : "password";
  }
}

