import { ApplicationConfig, ErrorHandler, importProvidersFrom, inject, provideAppInitializer, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withInMemoryScrolling, withViewTransitions } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { HttpClient, provideHttpClient, withInterceptors, withXhr } from '@angular/common/http';
import { httpErrorInterceptor } from './core/interceptors/http-error.interceptor';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { MatIconRegistry } from '@angular/material/icon';

import { routes } from './app.routes';
import { GlobalErrorHandler } from './global-error-handler';



export function httpLoaderFactory(http: HttpClient): TranslateHttpLoader {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    // `anchorScrolling` hace que Le Journal y Entrepreneurs puedan enlazar a una
    // sección de la landing (`routerLink="/" fragment="processus"`). Sólo actúa
    // en navegaciones que llevan fragmento; el resto de la app no lo usa.
    provideRouter(routes, withViewTransitions(), withInMemoryScrolling({ anchorScrolling: 'enabled' })),
    provideAnimations(),
    provideHttpClient(withXhr(), withInterceptors([httpErrorInterceptor])),
    { provide: ErrorHandler, useClass: GlobalErrorHandler },
    // mat-icon con ligadura (p. ej. «home») usa Material Symbols Outlined,
    // no la fuente antigua Material Icons. La fuente se carga en index.html.
    provideAppInitializer(() => {
      inject(MatIconRegistry).setDefaultFontSetClass('material-symbols-outlined');
    }),
    importProvidersFrom(
      TranslateModule.forRoot({
        defaultLanguage: 'fr',
        loader: {
          provide: TranslateLoader,
          useFactory: httpLoaderFactory,
          deps: [HttpClient],
        },
      })
    ),
  ],
};
