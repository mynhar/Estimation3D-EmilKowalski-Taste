import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '@ngx-translate/core';
import { ArchivarExpedienteComponent } from './archivar-expediente.component';

/**
 * Botón «Archivar» / «Desarchivar» de la cabecera. Abre la confirmación de
 * `<app-archivar-expediente>`, que tiene el estado y decide la acción con su
 * `[accion]` (ver ese componente). Las pantallas sin desarchivar lo ocultan
 * cuando el expediente ya está archivado.
 */
@Component({
  selector: 'app-boton-archivar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe, MatButtonModule, MatIconModule],
  templateUrl: './boton-archivar.component.html',
  styleUrl: './boton-archivar.component.css',
})
export class BotonArchivarComponent {
  control = input.required<ArchivarExpedienteComponent>();
}
