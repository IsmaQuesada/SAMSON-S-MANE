import { Component } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { GenericService } from '../../share/generic.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CartService } from '../../share/cart.service';
import { NotificacionService, TipoMessage } from '../../share/notification.service';
import { AuthenticationService } from '../../share/authentication.service';

@Component({
  selector: 'app-producto-detail',
  templateUrl: './producto-detail.component.html',
  styleUrl: './producto-detail.component.css'
})
export class ProductoDetailComponent {
  datos: any;
  destroy$: Subject<boolean> = new Subject<boolean>();
  isAuntenticated: boolean;
  currentUser: any;

  constructor(private gService: GenericService,
    private route:ActivatedRoute,
    private router: Router,
    private cartService: CartService,
    private noti:NotificacionService,
    private authService: AuthenticationService
  ) {
    let id=this.route.snapshot.paramMap.get('id')
    if(!isNaN(Number(id))) 
      this.obtenerProducto(Number(id))
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
  
  obtenerProducto(id: any) {
    this.gService
      .get('producto', id)
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: any) => {
        console.log(data);
        this.datos = data;
      });
  }

  actualizarProducto(id: number) {
    this.router.navigate(['/producto/update', id], {
      relativeTo: this.route,
    });
  }
  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  regresar() {
    this.router.navigate(['/producto'])
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
