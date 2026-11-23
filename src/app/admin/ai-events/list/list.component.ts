import { ChangeDetectionStrategy, Component, OnInit, computed, effect, inject, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { AsistenteEventoRepository, AsistenteEvento, TipoEvento } from '../../../data';
import { ToastService } from '../../../services/toast.service';
import { PaginationComponent } from '../../../shared/pagination/pagination.component';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header.component';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';

type FiltroTipo    = 'todos' | TipoEvento;
type FiltroResuelto = 'todos' | 'pendiente' | 'resuelto';

interface EstiloTipo { matIcon: string; tono: 'is-warn' | 'is-info'; }

/** Icono y tono de cada tipo: lo que pide atención humana en ámbar, el resto informativo. */
const TIPO_ESTILO: Record<string, EstiloTipo> = {
  salud_mencionada:                { matIcon: 'health_and_safety', tono: 'is-warn' },
  escalada_humana:                 { matIcon: 'support_agent',     tono: 'is-warn' },
  caso_externo:                    { matIcon: 'explore_off',       tono: 'is-info' },
  evidencia_incompleta_imprevisto: { matIcon: 'photo_camera',      tono: 'is-info' },
  imprevisto_anticipado:           { matIcon: 'report',            tono: 'is-info' },
  candidato_imprevisto:            { matIcon: 'lightbulb',         tono: 'is-info' },
};
const ESTILO_POR_DEFECTO: EstiloTipo = { matIcon: 'flag', tono: 'is-info' };

@Component({
  selector: 'app-admin-ai-events-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgTemplateOutlet, TranslatePipe,
    MatButtonModule, MatButtonToggleModule, MatFormFieldModule, MatIconModule, MatSelectModule,
    PageHeaderComponent, EmptyStateComponent, PaginationComponent,
  ],
  templateUrl: './list.component.html',
  styleUrls: ['../../../shared/ui/lista/lista.css', './list.component.css'],
})
export class AdminAiEventsListComponent implements OnInit {
  private repo      = inject(AsistenteEventoRepository);
  private translate = inject(TranslateService);
  private toast     = inject(ToastService);

  private _eventos = signal<AsistenteEvento[]>([]);
  cargando   = signal(true);
  error      = signal<string | null>(null);
  actualizando = signal<string | null>(null);

  filtroTipo     = signal<FiltroTipo>('todos');
  filtroResuelto = signal<FiltroResuelto>('pendiente');

  readonly TIPOS: FiltroTipo[] = [
    'todos', 'salud_mencionada', 'escalada_humana', 'caso_externo',
    'evidencia_incompleta_imprevisto', 'imprevisto_anticipado', 'candidato_imprevisto',
  ];
  readonly RESUELTOS: FiltroResuelto[] = ['todos', 'pendiente', 'resuelto'];

  readonly POR_PAGINA = 12;
  paginaActual = signal(1);

  eventosFiltrados = computed(() => {
    const tipo = this.filtroTipo();
    const res  = this.filtroResuelto();
    return this._eventos().filter(e => {
      if (tipo !== 'todos' && e.tipo !== tipo) return false;
      if (res === 'pendiente' && e.resuelto) return false;
      if (res === 'resuelto'  && !e.resuelto) return false;
      return true;
    });
  });

  eventosPaginados = computed(() => {
    const desde = (this.paginaActual() - 1) * this.POR_PAGINA;
    return this.eventosFiltrados().slice(desde, desde + this.POR_PAGINA);
  });

  hayFiltros = computed(() => this.filtroTipo() !== 'todos' || this.filtroResuelto() !== 'pendiente');
  pendientes = computed(() => this._eventos().filter(e => !e.resuelto).length);

  get total(): number { return this._eventos().length; }

  constructor() {
    effect(() => {
      this.filtroTipo();
      this.filtroResuelto();
      this.paginaActual.set(1);
    });
  }

  async ngOnInit() {
    try {
      this._eventos.set(await this.repo.findAll());
    } catch (e: any) {
      this.error.set(e?.message ?? this.translate.instant('admin_ai_events.err_load'));
    } finally {
      this.cargando.set(false);
    }
  }

  limpiarFiltros() {
    this.filtroTipo.set('todos');
    this.filtroResuelto.set('todos');
  }

  async alternarResuelto(ev: AsistenteEvento) {
    if (this.actualizando()) return;
    this.actualizando.set(ev.id);
    const nuevo = !ev.resuelto;
    try {
      await this.repo.marcarResuelto(ev.id, nuevo);
      this._eventos.update(list => list.map(x => x.id === ev.id ? { ...x, resuelto: nuevo } : x));
    } catch (e: any) {
      this.toast.show(e?.message ?? this.translate.instant('admin_ai_events.err_update'), 'danger');
    } finally {
      this.actualizando.set(null);
    }
  }

  tipoLabel(tipo: string): string {
    return this.translate.instant('admin_ai_events.tipo.' + tipo);
  }

  tipoEstilo(tipo: string): EstiloTipo {
    return TIPO_ESTILO[tipo] ?? ESTILO_POR_DEFECTO;
  }

  usuarioNombre(ev: AsistenteEvento): string {
    const u = ev.usuario;
    const n = `${u?.nombre ?? ''} ${u?.apellido ?? ''}`.trim();
    return n || '—';
  }

  rolLabel(rol: string): string {
    return this.translate.instant('role.' + rol);
  }

  fecha(iso: string): string {
    const lang = (this.translate.currentLang || 'fr').slice(0, 2);
    const locale = lang === 'es' ? 'es-ES' : lang === 'en' ? 'en-CA' : 'fr-CA';
    try {
      return new Date(iso).toLocaleString(locale, {
        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
      });
    } catch { return iso; }
  }
}
