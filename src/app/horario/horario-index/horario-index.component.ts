import { Component, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Subject, takeUntil } from 'rxjs';
import { GenericService } from '../../share/generic.service';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService } from '../../share/authentication.service';

@Component({
  selector: 'app-horario-index',
  templateUrl: './horario-index.component.html',
  styleUrls: ['./horario-index.component.css'],
})
export class HorarioIndexComponent {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  horariosDataSource = new MatTableDataSource<any>();
  diasBloqueadosDataSource = new MatTableDataSource<any>();
  sucursales: any;
  selectedSucursalId: number | null = null;

  horariosDisplayedColumns = [
    'sucursal',
    'diaSemana',
    'fecha',
    'horaInicio',
    'horaFin',
    'acciones',
  ];
  diasBloqueadosDisplayedColumns = [
    'sucursal',
    'diaSemana',
    'fecha',
    'horaInicio',
    'horaFin',
    'acciones',
  ];

  destroy$: Subject<boolean> = new Subject<boolean>();
  currentUser: any;
  currentUserAllData: any;

  constructor(
    private gService: GenericService,
    private dialog: MatDialog,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthenticationService
  ) {}

  ngAfterViewInit(): void {
    this.listSucursales();
  }

  ngOnInit(): void {
    this.authService.decodeToken.subscribe((user: any) => {
      this.currentUser = user;
    });

    this.obtenerUsuario(this.currentUser.id);
  }

  obtenerUsuario(id: any) {
    this.gService
        .get('usuario', id)
        .pipe(takeUntil(this.destroy$))
        .subscribe((data: any) => {
            this.currentUserAllData = data;

            if (this.currentUser.role === 'ENCARGADO') {
                this.selectedSucursalId = this.currentUserAllData.sucursalId;
                this.listHorarios();
            }
        });
}

  listSucursales() {
    this.gService
      .list('sucursal/')
      .pipe(takeUntil(this.destroy$))
      .subscribe((respuesta: any) => {
        this.sucursales = respuesta;
      });
  }

  listHorarios() {
    this.gService
      .list('sucursalHorarios/')
      .pipe(takeUntil(this.destroy$))
      .subscribe((respuesta: any) => {
        const horarios = [];
        const diasBloqueados = [];

        respuesta.forEach((sucursal: any) => {
          if (sucursal.horarios) {
            sucursal.horarios.forEach((horario: any) => {
              horarios.push({
                sucursalId: sucursal.id,
                sucursal: sucursal.nombre,
                diaSemana: horario.dia_semana,
                fecha: horario.fecha,
                horaInicio: horario.hora_inicio,
                horaFin: horario.hora_fin,
                id: horario.id,
              });
            });
          }
          if (sucursal.DiasBloqueados) {
            sucursal.DiasBloqueados.forEach((diaBloqueado: any) => {
              diasBloqueados.push({
                sucursalId: sucursal.id,
                sucursal: sucursal.nombre,
                diaSemana: diaBloqueado.dia_semana,
                fecha: diaBloqueado.fecha,
                horaInicio: diaBloqueado.hora_inicio,
                horaFin: diaBloqueado.hora_fin,
                id: diaBloqueado.id,
              });
            });
          }
        });

        this.horariosDataSource.data = horarios;
        this.diasBloqueadosDataSource.data = diasBloqueados;
        this.applyFilters();
      });
  }

  applyFilters() {
    if (this.selectedSucursalId) {
      this.horariosDataSource.data = this.horariosDataSource.data.filter(
        (horario) => horario.sucursalId === this.selectedSucursalId
      );
      this.diasBloqueadosDataSource.data =
        this.diasBloqueadosDataSource.data.filter(
          (bloqueo) => bloqueo.sucursalId === this.selectedSucursalId
        );
    }

    this.horariosDataSource.sort = this.sort;
    this.horariosDataSource.paginator = this.paginator;
    this.diasBloqueadosDataSource.sort = this.sort;
    this.diasBloqueadosDataSource.paginator = this.paginator;
  }

  onSucursalChange(event: any) {
    this.selectedSucursalId = event.value;
    this.listHorarios(); // Vuelve a listar horarios y bloqueos filtrados
}

  crearHorario() {
    this.router.navigate(['/horario/create'], { relativeTo: this.route });
  }

  crearBloqueo() {
    this.router.navigate(['/bloqueo/create'], { relativeTo: this.route });
  }

  detalleHorario(id: number) {
    this.router.navigate(['/horario', id]);
  }

  detalleBloqueo(id: number) {
    this.router.navigate(['/bloqueo', id]);
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
