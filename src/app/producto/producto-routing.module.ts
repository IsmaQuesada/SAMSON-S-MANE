import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProductoIndexComponent } from './producto-index/producto-index.component';
import { ProductoDetailComponent } from './producto-detail/producto-detail.component';
import { ProductoFormComponent } from './producto-form/producto-form.component';
import { authGuard } from '../share/auth.guard';

const routes: Routes = [
  { path: 'producto', component: ProductoIndexComponent },
  {
    path: 'producto/create',
    component: ProductoFormComponent,
    canActivate: [authGuard],
    data: {
      roles: ['ADMIN'],
    },
  },
  { path: 'producto/:id', component: ProductoDetailComponent },
  {
    path: 'producto/update/:id',
    component: ProductoFormComponent,
    canActivate: [authGuard],
    data: {
      roles: ['ADMIN'],
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProductoRoutingModule {}
