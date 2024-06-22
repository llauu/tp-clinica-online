import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp, getApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { provideStorage, getStorage } from '@angular/fire/storage';

import { environment } from '../environments/environment';

import { provideAnimations } from '@angular/platform-browser/animations';
import { provideToastr } from 'ngx-toastr';

import { provideHttpClient } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideFirebaseApp(() =>
      initializeApp({
        projectId: environment.projectId,
        appId: environment.appId,
        storageBucket: environment.storageBucket,
        apiKey: environment.apiKey,
        authDomain: environment.authDomain,
        messagingSenderId: environment.messagingSenderId,
      })
    ),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideStorage(() => getStorage(getApp(),"gs://tp-clinica-online-5cb54.appspot.com")),
    provideAnimations(), // required animations providers
    provideToastr(), // Toastr providers
    provideHttpClient(),
  ],
};
