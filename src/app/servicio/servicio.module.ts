import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ServicioRoutingModule } from './servicio-routing.module';
import { ServicioIndexComponent } from './servicio-index/servicio-index.component';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ServicioFormComponent } from './servicio-form/servicio-form.component';
import { ServicioDetailComponent } from './servicio-detail/servicio-detail.component';


@NgModule({
  declarations: [
    ServicioIndexComponent,
    ServicioFormComponent,
    ServicioDetailComponent
  ],
  imports: [
    CommonModule,
    ServicioRoutingModule,
    MatGridListModule,
    MatCardModule,
    MatMenuModule,
    MatIconModule,
    MatButtonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatDividerModule,
    MatDialogModule,
    MatInputModule,
    MatSelectModule,
    MatRadioModule,
    MatChipsModule,
    MatBadgeModule,
    FormsModule,
    ReactiveFormsModule, //Gestionar Formularios
  ]
})
export class ServicioModule { }
