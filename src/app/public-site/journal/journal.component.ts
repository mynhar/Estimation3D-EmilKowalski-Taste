import { ChangeDetectionStrategy, Component, ElementRef, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

import { SiteFooterComponent } from '../chrome/site-footer.component';
import { SiteHeaderComponent } from '../chrome/site-header.component';
import { JOURNAL_CARDS, JOURNAL_CATS, JournalCat } from './journal.data';

/**
 * Le Journal — página pública (sin guard), Lin et bronze. Cabecera y pie son los
 * de la landing (`app-site-header` / `app-site-footer`).
 *
 * El filtro por categoría es una signal derivada: la rejilla solo contiene las
 * fichas visibles y el lector de pantalla no anuncia las ocultas.
 */
@Component({
  selector: 'app-journal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, TranslatePipe, SiteHeaderComponent, SiteFooterComponent],
  templateUrl: './journal.component.html',
  styleUrls: ['../styles/site-base.css', './journal.component.css'],
})
export class JournalComponent {
  private host = inject(ElementRef<HTMLElement>).nativeElement as HTMLElement;

  readonly cats = JOURNAL_CATS;
  readonly activeCat = signal<JournalCat>('all');

  readonly cards = computed(() => {
    const cat = this.activeCat();
    return cat === 'all' ? JOURNAL_CARDS : JOURNAL_CARDS.filter(c => c.cat === cat);
  });

  setCat(cat: JournalCat): void { this.activeCat.set(cat); }

  /** «Aller au contenu»: foco en el <main> sin que el router trate el ancla. */
  saltar(event: Event): void {
    event.preventDefault();
    this.host.querySelector<HTMLElement>('#contenu')?.focus();
  }
}
