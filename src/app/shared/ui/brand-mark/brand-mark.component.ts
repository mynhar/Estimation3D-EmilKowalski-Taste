import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Marca de Estimation3D: un disco vélin con el perfil de una casa y su línea
 * de base en bronce (el trazo fino de la referencia) y la «E» en Cormorant,
 * espresso. Es decorativa (`aria-hidden`): el nombre lo pone quien la usa.
 *
 * - `tono="oscuro"`: sobre superficies espresso (disco espresso, bronce claro,
 *   letra crema).
 * - Tamaño: `--bm-size` en el host (36px por defecto).
 */
@Component({
  selector: 'app-brand-mark',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'aria-hidden': 'true', '[class.is-dark]': "tono() === 'oscuro'" },
  templateUrl: './brand-mark.component.html',
  styleUrl: './brand-mark.component.css',
})
export class BrandMarkComponent {
  tono = input<'claro' | 'oscuro'>('claro');
}
