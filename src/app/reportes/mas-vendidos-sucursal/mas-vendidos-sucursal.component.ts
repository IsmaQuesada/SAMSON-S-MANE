import { Component, ViewChild } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { GenericService } from '../../share/generic.service';
import Chart, { ChartDataset } from 'chart.js/auto';

@Component({
  selector: 'app-mas-vendidos-sucursal',
  templateUrl: './mas-vendidos-sucursal.component.html',
  styleUrl: './mas-vendidos-sucursal.component.css'
})
export class MasVendidosSucursalComponent {
  //Canvas para el grafico
  canvas: any;
  //Contexto del Canvas
  ctx: any;
  //Elemento html del Canvas
  @ViewChild('graficoCanvas') graficoCanvas!: { nativeElement: any };
  //Establecer gráfico
  grafico: any;
  //Datos para mostrar en el gráfico
  datos: any;
  //Lista de meses para filtrar el gráfico
  sucursales: any;
  //Mes actual
  filtro = 1;
  destroy$: Subject<boolean> = new Subject<boolean>();

  selectedSucursal: any = null;  // sucursal seleccionado

  constructor(
    private gService: GenericService
  ) {
    this.listSucursal();
  }
  //Listar todos las sucursales del API
  listSucursal() {
    //localhost:3000/videojuego
    this.gService
      .list('sucursal/')
      .pipe(takeUntil(this.destroy$))
      .subscribe((respuesta: any) => {
        console.log(respuesta);
        this.sucursales = respuesta;

      });
  }

  // Método para manejar la selección del servicio
  onSucursalSelect(service: any): void {
    this.selectedSucursal = service;

  }

  ngAfterViewInit(): void {
    this.inicioGrafico(this.filtro);
  }
  inicioGrafico(newValue: any) {
    this.filtro = newValue;
    console.log("filtro:" + this.filtro)
    if (this.filtro) {
      //Obtener datos del API
      this.gService
        .get('reporte/masVendidos', this.filtro)
        .pipe(takeUntil(this.destroy$))
        .subscribe((data: any) => {
          this.datos = data;
          this.graficoBrowser();

        })
    }
  }

  //Configurar y crear gráfico
  graficoBrowser(): void {
    this.canvas = this.graficoCanvas.nativeElement;
    this.ctx = this.canvas.getContext('2d');

    // Si existe, destruir el gráfico previo para mostrar el nuevo
    if (this.grafico) {
      this.grafico.destroy();
    }

    // Obtener las sucursales (únicas) para las etiquetas
    const sucursales = Array.from(new Set(this.datos.map(x => x.sucursal)));

    // Obtener los productos y servicios (únicos) para crear un dataset por cada uno
    const productosServicios: string[] = Array.from(new Set(this.datos.map(x => x.producto_servicio)));

    // Crear datasets para cada producto o servicio
    const datasets: ChartDataset<'bar'>[] = productosServicios.map((productoServicio: string) => {
      return {
        label: productoServicio,  // El label ahora es un string
        backgroundColor: this.getRandomColor(), // Puedes definir un método para obtener colores
        data: sucursales.map(sucursal => {
          const item = this.datos.find(x => x.sucursal === sucursal && x.producto_servicio === productoServicio);
          return item ? parseInt(item.cantidad_vendida, 10) : 0; // Convertir la cantidad a número
        })
      };
    });


    // Crear el gráfico
    this.grafico = new Chart(this.ctx, {
      type: 'bar',
      data: {
        labels: sucursales, // Etiquetas de las sucursales
        datasets: datasets  // Conjunto de datos por producto o servicio
      },
      options: {
        plugins: {
          title: {
            display: true,
            text: 'Cantidad de Servicios y Productos Vendidos por Sucursal'
          }
        },
        responsive: false,
        maintainAspectRatio: true,
        scales: {
          y: {
            ticks: {
              precision: 0 // Para mostrar solo enteros
            }
          }
        }
      }
    });
  }

  // Método auxiliar para obtener colores aleatorios (opcional)
  getRandomColor(): string {
    const r = Math.floor(Math.random() * 255);
    const g = Math.floor(Math.random() * 255);
    const b = Math.floor(Math.random() * 255);
    return `rgba(${r}, ${g}, ${b}, 0.5)`;
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    // Desinscribirse
    this.destroy$.unsubscribe();
  }
}
