import { Component } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { GenericService } from '../../share/generic.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-reserva-detail',
  templateUrl: './reserva-detail.component.html',
  styleUrl: './reserva-detail.component.css'
})
export class ReservaDetailComponent {
  datos: any;
  encargadoNombre: string = '';
  displayedColumns: string[] = ['servicio', 'TipoCorte', 'alergias', 'preferenciaProductos'];
  destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(private gService: GenericService, private route: ActivatedRoute) {
    let id = this.route.snapshot.paramMap.get('id');
    if (!isNaN(Number(id))) this.obtenerDetalles(Number(id));
  }

  obtenerDetalles(id: any) {
    this.gService
      .get('reserva', id)
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: any) => {
        console.log(data);
        this.datos = data;

        // Suponiendo que quieres mostrar el nombre del primer encargado
        if (this.datos.sucursal && this.datos.sucursal.encargados.length > 0) {
          this.encargadoNombre = this.datos.sucursal.encargados[0].nombre;
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
