import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FacturaIndexComponent } from './factura-index/factura-index.component';
import { FacturaDetailComponent } from './factura-detail/factura-detail.component';

const routes: Routes = [
  {path:'factura',component: FacturaIndexComponent},
  {path: 'factura/:id', component: FacturaDetailComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class FacturaRoutingModule { }
