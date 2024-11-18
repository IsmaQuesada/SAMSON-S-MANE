import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MasVendidosSucursalComponent } from './mas-vendidos-sucursal/mas-vendidos-sucursal.component';
import { ReservaEstadoComponent } from './reserva-estado/reserva-estado.component';

const routes: Routes = [
  { path: 'masVendidos/:id', component: MasVendidosSucursalComponent },
  { path: 'reservaEstado', component: ReservaEstadoComponent },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportesRoutingModule { }
