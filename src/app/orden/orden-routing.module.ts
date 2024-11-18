import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OrdenIndexComponent } from './orden-index/orden-index.component';
import { OrdenAllComponent } from './orden-all/orden-all.component';
import { authGuard } from '../share/auth.guard';

const routes: Routes = [
  {
    path: 'facturar',
    component: OrdenIndexComponent,
    canActivate: [authGuard],
    data: {
      roles: ['ADMIN', "ENCARGADO"],
    },
  },
  {
    path: 'orden/lista',
    component: OrdenAllComponent,
    canActivate: [authGuard],
    data: {
      roles: ['ADMIN', "ENCARGADO"],
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OrdenRoutingModule {}
