import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OrdenRoutingModule } from './orden-routing.module';
import { OrdenAllComponent } from './orden-all/orden-all.component';
import { OrdenIndexComponent } from './orden-index/orden-index.component';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatDividerModule } from '@angular/material/divider';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    OrdenAllComponent,
    OrdenIndexComponent
  ],
  imports: [
    CommonModule,
    OrdenRoutingModule,
    MatTableModule,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatIconModule,
    MatSelectModule,
    MatGridListModule,
    MatDividerModule,
    FormsModule, ReactiveFormsModule,
  ]
})
export class OrdenModule { }
