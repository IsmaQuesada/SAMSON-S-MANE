import { Component, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Subject, takeUntil } from 'rxjs';
import { GenericService } from '../../share/generic.service';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { CartService } from '../../share/cart.service';
import { NotificacionService, TipoMessage } from '../../share/notification.service';
import { AuthenticationService } from '../../share/authentication.service';

@Component({
  selector: 'app-servicio-index',
  templateUrl: './servicio-index.component.html',
  styleUrl: './servicio-index.component.css'
})
export class ServicioIndexComponent {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  //@ViewChild(MatTable) table!: MatTable<ServicioAllItem>;
  dataSource = new MatTableDataSource<any>();

  /** Columns displayed in the table. Columns IDs can be added, removed, or reordered. */
  displayedColumns = ['nombre', 'descripcion', 'tarifa','acciones'];
  //Respuesta del API
  datos: any;
  destroy$: Subject<boolean> = new Subject<boolean>();
  currentUser: any;
  filtro:"";

  constructor(private gService: GenericService,
    private dialog:MatDialog,
    private router:Router,
    private route:ActivatedRoute,
    private cartService: CartService,
    private noti:NotificacionService,
    private authService: AuthenticationService
  ) {}

  ngAfterViewInit(): void {
    this.listServicios()
  }

  ngOnInit(): void {
    this.authService.decodeToken.subscribe((user: any) => {
      this.currentUser = user;
    });
  }
  
  //Listar todos los Servicios del API
  listServicios() {
    this.gService
      .list('servicio/')
      .pipe(takeUntil(this.destroy$))
      .subscribe((respuesta: any) => {
        this.datos = respuesta;
  
        this.dataSource = new MatTableDataSource(this.datos);
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
  
        this.dataSource.filterPredicate = (data: any, filter: string) => {
          return data.nombre.toLowerCase().includes(filter);
        };
      });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.dataSource.data = this.datos.filter((item: any) => item.nombre.toLowerCase().includes(filterValue));
  }

  crearServicio() {
    this.router.navigate(['/servicio/create'], {
      relativeTo: this.route,
    });
  }

  actualizarServicio(id: number) {
    this.router.navigate(['/servicio/update', id], {
      relativeTo: this.route,
    });
  }

  detalle(id: number) {
    this.router.navigate(['/servicio', id])
  }
  
  comprar(id:number){
    this.gService.get("servicio/",id)
    .pipe(takeUntil(this.destroy$))
    .subscribe((respuesta:any)=>{
      //Agregarlo a la compra
      this.cartService.addToCart(respuesta, false)
      this.noti.mensaje(
        'Orden',
        'Servicio '+respuesta.nombre +' agregado a la orden',
        TipoMessage.success
      )
    })
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
