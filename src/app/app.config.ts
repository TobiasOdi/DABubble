import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideStorage, getStorage } from '@angular/fire/storage';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { environment } from '../environments/environment.development';

const firebaseConfig = {
  apiKey: "AIzaSyAmHLlg6nksAWT9uyaNO4O9qk9Tsq0dC4A",
  authDomain: "dabubble-2a0d1.firebaseapp.com",
  projectId: "dabubble-2a0d1",
  storageBucket: "dabubble-2a0d1.appspot.com",
  messagingSenderId: "715027715963",
  appId: "1:715027715963:web:556dd9e26663825eee0fde"
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimationsAsync(),
    importProvidersFrom([
      provideFirebaseApp(() => initializeApp(firebaseConfig)),
      provideStorage(() => getStorage()),
      provideFirestore(() => getFirestore()),
    ]),
  ],
};
