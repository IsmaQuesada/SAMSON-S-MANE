import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HorarioRoutingModule } from './horario-routing.module';
import { HorarioIndexComponent } from './horario-index/horario-index.component';
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
import { HorarioFormComponent } from './horario-form/horario-form.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { HorarioDetailComponent } from './horario-detail/horario-detail.component';
import { BloqueoDetailComponent } from './bloqueo-detail/bloqueo-detail.component';
import { BloqueoFormComponent } from './bloqueo-form/bloqueo-form.component';


@NgModule({
  declarations: [
    HorarioIndexComponent,
    HorarioFormComponent,
    HorarioDetailComponent,
    BloqueoDetailComponent,
    BloqueoFormComponent,
  ],
  imports: [
    CommonModule,
    HorarioRoutingModule,
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
    MatDatepickerModule,
    MatNativeDateModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class HorarioModule { }
