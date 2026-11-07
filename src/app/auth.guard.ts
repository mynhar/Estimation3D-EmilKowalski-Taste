import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthSupabaseService } from './services/auth-supabase.service';
import { ROLES_ESTIMADOR, ROLES_CONSTRUCTOR, ROLES_ADMINISTRADOR } from './roles';
import { RolUsuario } from './types/supabase';

// Espera a que el estado de auth se inicialice y devuelve [inicializado, usuario].
// Lee el estado actual (no un observable que puede ir un ciclo por detrás): tras
// cerrar sesión, /login tiene que ver ya al usuario como invitado. Si la
// inicialización tarda más de 8 s, se asume no autenticado.
async function esperarAuth(
  auth: AuthSupabaseService,
): Promise<[boolean, import('@supabase/supabase-js').User | null]> {
  return [true, await auth.usuarioActual()];
}

// Espera a que el rol se resuelva. Timeout o sin perfil → null (sin acceso).
async function resolverRol(auth: AuthSupabaseService): Promise<RolUsuario | null> {
  return auth.rolActual();
}

export const authGuard: CanActivateFn = async () => {
  const auth   = inject(AuthSupabaseService);
  const router = inject(Router);
  const [, user] = await esperarAuth(auth);
  return user ? true : router.createUrlTree(['/login']);
};

export const estimatorGuard: CanActivateFn = async () => {
  const auth   = inject(AuthSupabaseService);
  const router = inject(Router);
  const [, user] = await esperarAuth(auth);
  if (!user) return router.createUrlTree(['/login']);
  const rol = await resolverRol(auth);
  return rol && ROLES_ESTIMADOR.includes(rol)
    ? true
    : router.createUrlTree([await auth.getHomeRoute()]);
};

export const constructorGuard: CanActivateFn = async () => {
  const auth   = inject(AuthSupabaseService);
  const router = inject(Router);
  const [, user] = await esperarAuth(auth);
  if (!user) return router.createUrlTree(['/login']);
  const rol = await resolverRol(auth);
  return rol && ROLES_CONSTRUCTOR.includes(rol)
    ? true
    : router.createUrlTree([await auth.getHomeRoute()]);
};

export const adminGuard: CanActivateFn = async () => {
  const auth   = inject(AuthSupabaseService);
  const router = inject(Router);
  const [, user] = await esperarAuth(auth);
  if (!user) return router.createUrlTree(['/login']);
  const rol = await resolverRol(auth);
  return rol && ROLES_ADMINISTRADOR.includes(rol)
    ? true
    : router.createUrlTree([await auth.getHomeRoute()]);
};

export const wildcardGuard: CanActivateFn = async () => {
  const auth   = inject(AuthSupabaseService);
  const router = inject(Router);
  const [, user] = await esperarAuth(auth);
  if (!user) return router.createUrlTree(['/login']);
  try {
    return router.createUrlTree([await auth.getHomeRoute()]);
  } catch {
    return router.createUrlTree(['/login']);
  }
};

export const guestGuard: CanActivateFn = async () => {
  const auth   = inject(AuthSupabaseService);
  const router = inject(Router);
  const [, user] = await esperarAuth(auth);
  if (!user) return true;
  try {
    return router.createUrlTree([await auth.getHomeRoute()]);
  } catch {
    return true;
  }
};
