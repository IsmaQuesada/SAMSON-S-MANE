import { Component, ViewChild } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { GenericService } from '../../share/generic.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { AuthenticationService } from '../../share/authentication.service';

@Component({
  selector: 'app-reserva-index',
  templateUrl: './reserva-index.component.html',
  styleUrl: './reserva-index.component.css',
})
export class ReservaIndexComponent {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  //@ViewChild(MatTable) table!: MatTable<FacturaTableItem>;
  dataSource = new MatTableDataSource<any>();

  /** Columns displayed in the table. Columns IDs can be added, removed, or reordered. */
  displayedColumns = ['id', 'fecha', 'cliente', 'estado', 'acciones'];
  //Respuesta del API
  datos: any;
  destroy$: Subject<boolean> = new Subject<boolean>();
  isAuntenticated: boolean;
  idUser: any;
  filtro: string = '';
  filterDatos: any;
  fechaSeleccionada: Date | null = null; // Variable para almacenar la fecha seleccionada
  currentUser: any;

  //colores del estado
  estadoColors: { [key: string]: string } = {
    PENDIENTE: '#FFC107', // Amarillo
    CONFIRMADA: '#4CAF50', // Verde
    REPROGRAMADA: '#03A9F4', // Azul
    COMPLETADA: '#8BC34A', // Verde claro
    CANCELADA: '#F44336', // Rojo
    NO_ASISTIO: '#9E9E9E', // Gris
  };

  constructor(
    private gService: GenericService,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthenticationService
  ) {}

  ngAfterViewInit(): void {
    this.listReservas(); //reemplazar por Listado de reservas
  }
  //usuario encargado
  ngOnInit(): void {
    this.authService.isAuthenticated.subscribe((valor) => {
      this.isAuntenticated = valor;
    });

    this.authService.decodeToken.subscribe((user: any) => {
      this.obtenerUsuario(user.id);
    });
  }

  crearReserva() {
    this.router.navigate(['/reserva/create'], {
      relativeTo: this.route,
    });
  }

  obtenerUsuario(id: any) {
    this.gService
      .get('usuario', id)
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: any) => {
        this.currentUser = data;
        console.dir(this.currentUser);
      });
  }

  buscarResesrvarClientes(nombre: any) {
    if (nombre) {
      this.gService
        .get('reserva/byCliente', nombre)
        .pipe(takeUntil(this.destroy$))
        .subscribe((respuesta: any) => {
          let filtro: any;

          if (this.currentUser.role === 'CLIENT')
            filtro = respuesta.filter(
              (reserva: any) => reserva.clienteId === this.currentUser.id
            );

          if (this.currentUser.role === 'ENCARGADO')
            filtro = respuesta.filter(
              (reserva: any) =>
                reserva.sucursalId === this.currentUser.sucursalId
            );

          this.datos = filtro || respuesta;

          this.dataSource = new MatTableDataSource(this.datos);
          this.dataSource.sort = this.sort;
          this.dataSource.paginator = this.paginator;
        });
    } else {
      this.listReservas();
    }
  }

  // Asegúrate de tener el tipo de evento correcto
  onDateChange(event: MatDatepickerInputEvent<Date>): void {
    if (event.value) {
      this.buscarReservasPorFecha(event.value);
    } else {
      event.value = null;
    }
  }

  buscarReservasPorFecha(fecha: Date): void {
    // Verificar si 'fecha' es un objeto Date
    if (!(fecha instanceof Date)) {
      console.error('El valor proporcionado no es un objeto Date:', fecha);
      return;
    }

    const fechaFormateada = this.formatDate(fecha);
    this.gService
      .get('reserva/byFecha', fechaFormateada)
      .pipe(takeUntil(this.destroy$))
      .subscribe((respuesta: any) => {
        let filtro: any;

        if (this.currentUser.role === 'CLIENT')
          filtro = respuesta.filter(
            (reserva: any) => reserva.clienteId === this.currentUser.id
          );

        if (this.currentUser.role === 'ENCARGADO')
          filtro = respuesta.filter(
            (reserva: any) => reserva.sucursalId === this.currentUser.sucursalId
          );

        this.datos = filtro || respuesta;

        this.dataSource = new MatTableDataSource(this.datos);
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
      });
  }

  formatDate(date: Date): string {
    // Verificar si 'date' es un objeto Date
    if (!(date instanceof Date)) {
      console.error('El valor proporcionado no es un objeto Date:', date);
      return '';
    }

    const day = ('0' + date.getDate()).slice(-2);
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
  }

  //Listar todos los Reservas del API
  listReservas() {
    //localhost:3000/videojuego
    this.gService
      .list('reserva/')
      .pipe(takeUntil(this.destroy$))
      .subscribe((respuesta: any) => {
        let filtro: any;

        if (this.currentUser.role === 'CLIENT')
          filtro = respuesta.filter(
            (reserva: any) => reserva.clienteId === this.currentUser.id
          );

        if (this.currentUser.role === 'ENCARGADO')
          filtro = respuesta.filter(
            (reserva: any) => reserva.sucursalId === this.currentUser.sucursalId
          );

        this.datos = filtro || respuesta;

        this.dataSource = new MatTableDataSource(this.datos);
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
      });
  }

  detalle(id: number) {
    this.router.navigate(['/reserva', id]);
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  limpiar() {
    this.filtro = '';
    this.fechaSeleccionada = null;
    this.listReservas();
  }
}
