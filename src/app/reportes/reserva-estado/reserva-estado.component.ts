import { Component } from '@angular/core';
import { EChartsOption } from 'echarts';
import * as echarts from 'echarts';
import { GenericService } from '../../share/generic.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-reserva-estado',
  templateUrl: './reserva-estado.component.html',
  styleUrl: './reserva-estado.component.css'
})
export class ReservaEstadoComponent {
  destroy$: Subject<boolean> = new Subject<boolean>();
  data = null;
  optionsBar: EChartsOption
  optionsLine: EChartsOption
  mergeOptions: EChartsOption;

  constructor(private gService: GenericService) {
    this.listaOrdenes()
  }

  listaOrdenes() {
    this.gService
      .list('reporte/reservas-por-estado/')
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        this.data = data;

        // Extraer etiquetas (estados) y valores (cantidades)
        const estados = this.data.map((item: any) => item.estado);
        const cantidades = this.data.map((item: any) => item._count.id);

        // Configurar opciones para el gráfico de líneas
        this.optionsLine = {
          title: {
            text: 'Reservas por Estado',
            subtext: 'Cantidad de reservas por estado',
            left: 'center'
          },
          tooltip: {},
          legend: {
            data: ['Cantidad de ']
          },
          xAxis: {
            type: 'category',
            data: estados
          },
          yAxis: {
            type: 'value',
            name: 'Cantidad',
            min: 0
          },
          series: [{
            name: 'Cantidad de Reservas',
            type: 'line',
            data: cantidades,
            symbol: 'circle',
            itemStyle: {
              color: 'rgba(75, 192, 192, 0.5)'
            }
          }]
        };

        
      });
  }

}
