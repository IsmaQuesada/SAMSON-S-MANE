import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ServicioIndexComponent } from './servicio-index/servicio-index.component';
import { ServicioDetailComponent } from './servicio-detail/servicio-detail.component';
import { ServicioFormComponent } from './servicio-form/servicio-form.component';
import { authGuard } from '../share/auth.guard';

const routes: Routes = [
  { path: 'servicio', component: ServicioIndexComponent },
  {
    path: 'servicio/create',
    component: ServicioFormComponent,
    canActivate: [authGuard],
    data: {
      roles: ['ADMIN'],
    },
  },
  { path: 'servicio/:id', component: ServicioDetailComponent },

  {
    path: 'servicio/update/:id',
    component: ServicioFormComponent,
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
export class ServicioRoutingModule {}
