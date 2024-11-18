import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReservaIndexComponent } from './reserva-index/reserva-index.component';
import { ReservaDetailComponent } from './reserva-detail/reserva-detail.component';
import { ReservaFormComponent } from './reserva-form/reserva-form.component';

const routes: Routes = [
  { path: 'reserva', component: ReservaIndexComponent },
  { path: 'reserva/create', component: ReservaFormComponent },
  { path: 'reserva/:id', component: ReservaDetailComponent },
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReservaRoutingModule { }
