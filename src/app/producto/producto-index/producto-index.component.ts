import { Component } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { GenericService } from '../../share/generic.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CartService } from '../../share/cart.service';
import { NotificacionService, TipoMessage } from '../../share/notification.service';
import { AuthenticationService } from '../../share/authentication.service';

@Component({
  selector: 'app-producto-index',
  templateUrl: './producto-index.component.html',
  styleUrl: './producto-index.component.css'
})
export class ProductoIndexComponent {
  //Respuesta del API
  datos: any
  destroy$: Subject<boolean> = new Subject<boolean>();
  isAuntenticated: boolean;
  currentUser: any;
  filterDatos:any
  productos: any;
  lCategorias: any;
  filtro:string=""
  categorias: any;  
  ventasFiltradas: boolean = false;

  constructor(private gService: GenericService,
    private router: Router,
    private route:ActivatedRoute,
    private cartService: CartService,
    private noti:NotificacionService,
    private authService: AuthenticationService
  ) {
    this.listProductos()
    this.listCategorias();
  }
  //Listar todos los productos del API
  listProductos() {
    //localhost:3000/producto
    this.gService.list("producto/")
      .pipe(takeUntil(this.destroy$))
      .subscribe((respuesta: any) => {
        console.log(respuesta)
        this.datos = respuesta
        this.filterDatos = this.datos;
      }
      )
  }

  listMasVentas() {
    //localhost:3000/producto
    this.gService.list("producto/masVendidos/")
      .pipe(takeUntil(this.destroy$))
      .subscribe((respuesta: any) => {
        console.log(respuesta)
        this.datos = respuesta
        this.filterDatos = this.datos;
      }
      )
  }
  
  listCategorias(){
    //localhost:3000/videojuego
    this.gService.list("categoria/")
    .pipe(takeUntil(this.destroy$))
    .subscribe((respuesta:any)=>{
      console.log(respuesta)
      this.lCategorias=respuesta
    })
  }

  ngOnInit(): void {
    this.authService.isAuthenticated.subscribe((valor) => {
      this.isAuntenticated = valor;
    });

    //Información usuario actual
    this.authService.decodeToken.subscribe((user: any) => {
      this.currentUser = user;
    });
  }

  detalle(id: number) {
    this.router.navigate(['/producto', id])
  }

  crearProducto() {
    this.router.navigate(['/producto/create'], {
      relativeTo: this.route,
    });
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  buscarProductos(){
    if(!this.filtro && (!this.categorias || Object.keys(this.categorias).length === 0)){
    this.filterDatos = this.datos;
  }

  if(this.filtro){
    this.filterDatos = this.datos.filter(
      producto => producto.nombre.toLowerCase().includes(this.filtro.toLowerCase())
    );
  }

  if(this.categorias && Object.keys(this.categorias).length > 0){
    this.filterDatos = this.datos.filter(
      producto => this.categorias.includes(producto.categoria.id)
    );
  }
  }

  comprar(id:number){
    this.gService.get("producto/",id)
    .pipe(takeUntil(this.destroy$))
    .subscribe((respuesta:any)=>{
      //Agregarlo a la compra
      this.cartService.addToCart(respuesta, true)
      this.noti.mensaje(
        'Orden',
        'Producto '+respuesta.nombre +' agregado a la orden',
        TipoMessage.success
      )
    })
  }
}
