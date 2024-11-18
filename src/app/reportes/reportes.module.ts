import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReportesRoutingModule } from './reportes-routing.module';
import { MasVendidosSucursalComponent } from './mas-vendidos-sucursal/mas-vendidos-sucursal.component';
import { ReservaEstadoComponent } from './reserva-estado/reserva-estado.component';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { NgxEchartsModule } from 'ngx-echarts';
import * as echarts from 'echarts';


@NgModule({
  declarations: [
    MasVendidosSucursalComponent,
    ReservaEstadoComponent
  ],
  imports: [
    CommonModule,
    ReportesRoutingModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    NgxEchartsModule,
    NgxEchartsModule.forRoot({
      echarts,
    })
  ]
})
export class ReportesModule { }
