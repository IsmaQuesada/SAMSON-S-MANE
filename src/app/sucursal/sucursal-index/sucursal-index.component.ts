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
  selector: 'app-sucursal-index',
  templateUrl: './sucursal-index.component.html',
  styleUrl: './sucursal-index.component.css'
})
export class SucursalIndexComponent {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  //@ViewChild(MatTable) table!: MatTable<VideojuegoAllItem>;
  dataSource = new MatTableDataSource<any>();

  /** Columns displayed in the table. Columns IDs can be added, removed, or reordered. */
  displayedColumns = ['nombre', 'descripcion', 'telefono','acciones'];
  //Respuesta del API
  datos: any;
  destroy$: Subject<boolean> = new Subject<boolean>();
  currentUser: any;

  constructor(private gService: GenericService,
    private dialog:MatDialog,
    private router:Router,
    private route:ActivatedRoute,
    private authService: AuthenticationService
  ) {}

  ngOnInit(): void {
    this.authService.decodeToken.subscribe((user: any) => {
      this.currentUser = user;
    });
  }

  ngAfterViewInit(): void {
    this.listSucursal()
  }
  
  //Listar todos los videojuegos del API
  listSucursal() {
    //localhost:3000/videojuego
    this.gService
      .list('sucursal/')
      .pipe(takeUntil(this.destroy$))
      .subscribe((respuesta: any) => {
        console.log(respuesta);
        this.datos = respuesta;
        this.dataSource = new MatTableDataSource(this.datos);
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
        
      });
  }

  crearSucursal() {
    this.router.navigate(['/sucursal/create'], {
      relativeTo: this.route,
    });
  }

  actualizarSucursal(id: number) {
    this.router.navigate(['/sucursal/update', id], {
      relativeTo: this.route,
    });
  }

  detalle(id: number) {
    this.router.navigate(['/sucursal', id])
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
