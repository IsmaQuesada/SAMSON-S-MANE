import { Component, ViewChild } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import {
  NotificacionService,
  TipoMessage,
} from '../../share/notification.service';
import { MatTableDataSource } from '@angular/material/table';
import { AuthenticationService } from '../../share/authentication.service';
import { CartService } from '../../share/cart.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { GenericService } from '../../share/generic.service';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.css',
})
export class UserListComponent {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  //@ViewChild(MatTable) table!: MatTable<VideojuegoAllItem>;
  dataSource = new MatTableDataSource<any>();

  /** Columns displayed in the table. Columns IDs can be added, removed, or reordered. */
  displayedColumns = ['nombre', 'email', 'telefono', 'rol', 'acciones'];
  //Respuesta del API
  datos: any;
  destroy$: Subject<boolean> = new Subject<boolean>();
  currentUser: any;

  constructor(
    private gService: GenericService,
    private dialog: MatDialog,
    private router: Router,
    private route: ActivatedRoute,
    private cartService: CartService,
    private noti: NotificacionService,
    private authService: AuthenticationService
  ) {}

  ngAfterViewInit(): void {
    this.listUsuarios();
  }

  ngOnInit(): void {
    this.authService.decodeToken.subscribe((user: any) => {
      this.currentUser = user;
    });
  }

  //Listar todos los videojuegos del API
  listUsuarios() {
    //localhost:3000/videojuego
    this.gService
      .list('usuario/getUsuarios')
      .pipe(takeUntil(this.destroy$))
      .subscribe((respuesta: any) => {
        console.log(respuesta);
        this.datos = respuesta;
        this.dataSource = new MatTableDataSource(this.datos);
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
      });
  }

  crearUsuario() {
    this.router.navigate(['/registrar'], {
      relativeTo: this.route,
    });
  }

  actualizarUsuario(id: number) {
    this.router.navigate(['/actualizar', id], {
      relativeTo: this.route,
    });
  }

  detalle(id: number) {
    this.router.navigate(['/usuario', id]);
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
