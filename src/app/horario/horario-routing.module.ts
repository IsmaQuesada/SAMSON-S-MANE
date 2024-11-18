import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HorarioIndexComponent } from './horario-index/horario-index.component';
import { HorarioFormComponent } from './horario-form/horario-form.component';
import { HorarioDetailComponent } from './horario-detail/horario-detail.component';
import { BloqueoDetailComponent } from './bloqueo-detail/bloqueo-detail.component';
import { BloqueoFormComponent } from './bloqueo-form/bloqueo-form.component';
import { authGuard } from '../share/auth.guard';

const routes: Routes = [
  { path: 'horario', component: HorarioIndexComponent },
  {
    path: 'horario/create',
    component: HorarioFormComponent,
    canActivate: [authGuard],
    data: {
      roles: ['ADMIN', 'ENCARGADO'],
    },
  },
  {
    path: 'bloqueo/create',
    component: BloqueoFormComponent,
    canActivate: [authGuard],
    data: {
      roles: ['ADMIN', 'ENCARGADO'],
    },
  },
  { path: 'horario/:id', component: HorarioDetailComponent },
  { path: 'bloqueo/:id', component: BloqueoDetailComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HorarioRoutingModule {}
