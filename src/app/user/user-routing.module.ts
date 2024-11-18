import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserIndexComponent } from './user-index/user-index.component';
import { UserLoginComponent } from './user-login/user-login.component';
import { UserCreateComponent } from './user-create/user-create.component';
import { UserListComponent } from './user-list/user-list.component';
import { UserDetailComponent } from './user-detail/user-detail.component';
import { UserUpdateComponent } from './user-update/user-update.component';
import { authGuard } from '../share/auth.guard';

const routes: Routes = [
  {
    path: 'usuario',
    component: UserIndexComponent,
    children: [{ path: 'login', component: UserLoginComponent }],
  },
  {
    path: 'listaUsuarios',
    component: UserListComponent,
    canActivate: [authGuard],
    data: {
      roles: ['ADMIN'],
    },
  },
  {
    path: 'usuario/:id',
    component: UserDetailComponent,
    canActivate: [authGuard],
    data: {
      roles: ['ADMIN'],
    },
  },
  { path: 'registrar', component: UserCreateComponent },
  {
    path: 'actualizar/:id',
    component: UserUpdateComponent,
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
export class UserRoutingModule {}
