import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { GenericService } from '../../share/generic.service';
import { AuthenticationService } from '../../share/authentication.service';
import {
  NotificacionService,
  TipoMessage,
} from '../../share/notification.service';

@Component({
  selector: 'app-factura-index',
  templateUrl: './factura-index.component.html',
  styleUrls: ['./factura-index.component.css'],
})
export class FacturaIndexComponent implements OnInit, OnDestroy {
  datos: any[] = [];
  filteredDatos: any[] = [];
  clientes: any[] = []; // Aquí irán los clientes disponibles
  destroy$: Subject<boolean> = new Subject<boolean>();
  selectedCliente: number | null = null;
  selectedFecha: Date | null = null;
  sucursalId: number = 0; // Define el ID de la sucursal que quieres filtrar
  currentUser: any;

  constructor(
    private gService: GenericService,
    private router: Router,
    private authService: AuthenticationService,
    private noti: NotificacionService
  ) {}

  ngOnInit(): void {
    this.getCurrentUser();
    this.listFacturas();
    this.listClientes(); // Obtener la lista de clientes
  }

  private obtenerEncargado(id: any) {
    this.gService
      .get('usuario/', id)
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: any) => {
        this.sucursalId = data.sucursalId;
        this.currentUser = data;
      });
  }

  private getCurrentUser(): void {
    this.authService.decodeToken.pipe(takeUntil(this.destroy$)).subscribe({
      next: (user: any) => {
        this.obtenerEncargado(user.id);
      },
      error: (err) => this.handleError(err, 'Error al obtener el usuario'),
    });
  }

  listFacturas() {
    this.gService
      .list('factura/')
      .pipe(takeUntil(this.destroy$))
      .subscribe((respuesta: any) => {
        this.datos = respuesta;
        this.filterFacturas(); // Filtrar después de obtener los datos
      });
  }

  listClientes() {
    // Obtener la lista de clientes desde el servicio (ajustar según tu implementación)
    this.gService
      .list('usuario/getClientes')
      .pipe(takeUntil(this.destroy$))
      .subscribe((respuesta: any) => {
        this.clientes = respuesta;
      });
  }

  filterFacturas() {
    if (this.currentUser.role === 'ADMIN') {
      this.filteredDatos = this.datos.filter((item) => {
        return item.estado !== false;
      });
    }

    if (this.currentUser.role === 'ENCARGADO') {
      this.filteredDatos = this.datos.filter((item) => {
        const matchSucursal = item.sucursal_id === this.sucursalId; // Filtro de sucursal

        const matchCliente = this.selectedCliente
          ? item.cliente_id === this.selectedCliente
          : true;
        const matchFecha = this.selectedFecha
          ? new Date(item.fecha).toDateString() ===
            new Date(this.selectedFecha).toDateString()
          : true;

        const estado = item.estado !== false;

        return matchSucursal && matchCliente && matchFecha && estado;
      });
    }

    if (this.currentUser.role === 'CLIENT') {
      this.filteredDatos = this.datos.filter((item) => {
        return item.cliente_id == this.currentUser.id;
      });
    }
  }

  detalle(id: number) {
    this.router.navigate(['/factura', id]);
  }

  limpiar() {
    this.selectedCliente = null;
    this.selectedFecha = null;
    this.listFacturas();
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  private handleError(error: any, message: string): void {
    console.error(message, error);
    this.noti.mensaje('Error', message, TipoMessage.error);
  }
}
