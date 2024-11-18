import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { CartService } from '../../share/cart.service';
import {
  NotificacionService,
  TipoMessage,
} from '../../share/notification.service';
import { GenericService } from '../../share/generic.service';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../share/authentication.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-orden-index',
  templateUrl: './orden-index.component.html',
  styleUrls: ['./orden-index.component.css'],
})
export class OrdenIndexComponent implements OnInit, OnDestroy {
  displayedColumns = [
    'producto',
    'precio',
    'cantidad',
    'subtotal',
    'impuesto',
    'acciones',
  ];
  displayedColumnsServices = [
    'servicio',
    'precio',
    'cantidad',
    'subtotal',
    'impuesto',
    'acciones',
  ];

  dataSource = new MatTableDataSource<any>();
  dataSourceServices = new MatTableDataSource<any>();

  totalProductos: number = 0;
  totalServicios: number = 0;
  impuesto: number = 0;
  total: number = 0;

  fecha = new Date(); // Usar la fecha actual
  currentUser: any;
  sucursal: any; // Nombre de la sucursal del encargado
  cliente: any; // Información del cliente seleccionado
  destroy$ = new Subject<void>();
  clientesList: any[] = [];
  selectedClienteId: number | null = null; // ID del cliente seleccionado
  productos: any[] = [];
  servicios: any[] = [];

  constructor(
    private cartService: CartService,
    private noti: NotificacionService,
    private gService: GenericService,
    private router: Router,
    private authService: AuthenticationService
  ) {
    this.initData();
  }

  ngOnInit(): void {
    this.initData();
    this.loadClientes();
    this.getCurrentUser();
    this.actualizarTotales();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initData(): void {
    if (this.cartService.currentDataCart$) {
      this.cartService.currentDataCart$
        .pipe(takeUntil(this.destroy$))
        .subscribe((data) => {
          if (data) {
            // Verifica si data no es null o undefined
            this.productos = data.filter((item) => item.tipo);
            this.servicios = data.filter((item) => !item.tipo);
            this.dataSource.data = this.productos;
            this.dataSourceServices.data = this.servicios;
          } else {
            // Manejar el caso en que data es null o undefined
            this.productos = [];
            this.servicios = [];
            this.dataSource.data = [];
            this.dataSourceServices.data = [];
          }
        });

      this.cartService.getTotal
        .pipe(takeUntil(this.destroy$))
        .subscribe((valor) => (this.total = valor));

      this.cartService.getTotalProductos
        .pipe(takeUntil(this.destroy$))
        .subscribe((valor) => (this.totalProductos = valor));

      this.cartService.getTotalServicios
        .pipe(takeUntil(this.destroy$))
        .subscribe((valor) => (this.totalServicios = valor));
    }
  }

  private getCurrentUser(): void {
    this.authService.decodeToken.pipe(takeUntil(this.destroy$)).subscribe({
      next: (user: any) => {
        this.obtenerEncargado(user.id);
      },
      error: (err) => this.handleError(err, 'Error al obtener el usuario'),
    });
  }

  private obtenerEncargado(id: any) {
    this.gService
      .get('usuario', id)
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: any) => {
        this.currentUser = data;
        this.sucursal = data.sucursal;
      });
  }

  private loadClientes(): void {
    this.gService
      .list('usuario/getClientes')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => (this.clientesList = data),
        error: (err) => this.handleError(err, 'Error al cargar clientes'),
      });
  }

  obtenerCliente(id: number): void {
    if (id) {
      this.gService
        .get('usuario', id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (data: any) => (this.cliente = data),
          error: (err) => this.handleError(err, 'Error al obtener el cliente'),
        });
    } else {
      this.cliente = null;
    }
  }

  actualizarCantidadProducto(item: any) {
    this.cartService.addToCart(item, true);
    this.actualizarTotales();
  }

  actualizarCantidadServicio(item: any) {
    this.cartService.addToCart(item, false);
    this.actualizarTotales();
  }

  eliminarItem(item: any) {
    this.cartService.removeFromCart(item);
    this.actualizarTotales();
  }

  actualizarTotales() {
    this.totalProductos = this.dataSource.data.reduce(
      (acc, item) => acc + item.subtotal,
      0
    );
    this.totalServicios = this.dataSourceServices.data.reduce(
      (acc, item) => acc + item.subtotal,
      0
    );
    this.total = this.totalProductos + this.totalServicios;
    this.impuesto = this.total * 0.13; // Impuesto del 13%
  }

  facturar() {
    if (!this.cliente) {
      this.noti.mensaje(
        'Orden',
        'Debe seleccionar un cliente para completar la factura',
        TipoMessage.warning
      );
      return;
    }

    const itemCompra = this.cartService.getItems;

    if (itemCompra.length > 0) {
      const now = new Date();
      const fechaFactura = now.toISOString();

      const detalle = itemCompra.map((item) => {
        const precio = item.precio;
        const subtotal = precio * item.cantidad;
        const impuesto = subtotal * 0.13; // Calcular el impuesto para ese ítem

        return {
          productoId: item.tipo ? item.idItem : null,
          servicioId: item.tipo ? null : item.idItem,
          cantidad: item.cantidad,
          precio: precio,
          subtotal: subtotal,
          impuesto: impuesto,
        };
      });

      const totalImpuesto = detalle.reduce(
        (sum, item) => sum + item.impuesto,
        0
      );

      const totalConImpuesto = this.total + totalImpuesto;

      const factura = {
        fechaFactura: fechaFactura,
        detalles: detalle,
        sucursal: this.sucursal.id,
        cliente: this.cliente.id,
        encargado: this.currentUser.id,
        total: totalConImpuesto, // Total con impuesto incluido
      };

      this.gService.create('factura', factura).subscribe({
        next: (respuesta) => {
          this.cartService.deleteCart();

          this.noti.mensaje(
            'Proforma',
            'Proforma creada #' + respuesta.facturaId,
            TipoMessage.success
          );

          this.router.navigate(['/factura/' + respuesta.facturaId]);
        },
        error: (err) => this.handleError(err, 'Error al emitir la factura'),
      });
    } else {
      this.noti.mensaje(
        'Orden',
        'Agregue servicios o productos a la factura',
        TipoMessage.warning
      );
    }
  } 
  
  limpiar(): void {
    // Limpiar el carrito
    this.cartService.deleteCart();

    // Limpiar los datos de la tabla
    this.dataSource.data = [];
    this.dataSourceServices.data = [];

    // Limpiar la información del cliente
    this.cliente = null;

    // Restablecer totales
    this.totalProductos = 0;
    this.totalServicios = 0;
    this.total = 0;
    this.impuesto = 0;

    // Restablecer el ID del cliente seleccionado
    this.selectedClienteId = null;
  }

  private handleError(error: any, message: string): void {
    console.error(message, error);
    this.noti.mensaje('Error', message, TipoMessage.error);
  }
}
