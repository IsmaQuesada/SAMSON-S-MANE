import { Component, ElementRef, Renderer2 } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { GenericService } from '../../share/generic.service';
import { MatTableDataSource } from '@angular/material/table';
import {
  NotificacionService,
  TipoMessage,
} from '../../share/notification.service';

@Component({
  selector: 'app-factura-detail',
  templateUrl: './factura-detail.component.html',
  styleUrls: ['./factura-detail.component.css'], // Corrección aquí
})
export class FacturaDetailComponent {
  datos: any;
  productosApi: any[] = []; // Aquí almacenamos los productos disponibles
  serviciosApi: any[] = []; // Aquí almacenamos los servicios disponibles
  header = document.querySelector('.factura-header');

  displayedColumnsProductos = [
    'codigo',
    'producto',
    'cantidad',
    'precioUnitario',
    'total',
    'eliminar',
  ];

  displayedColumnsServices = [
    'codigo',
    'servicio',
    'cantidad',
    'precioUnitario',
    'total',
    'eliminar',

  ];

  productos = new MatTableDataSource<any>([]);
  validProduct: boolean = true;

  servicios = new MatTableDataSource<any>([]);
  validService: boolean = true;

  destroy$: Subject<boolean> = new Subject<boolean>();

  /*   productosDisponibles: any[] = [];
    serviciosDisponibles: any[] = []; */

  // Variables adicionales
  actualizando: boolean = false;
  productoSeleccionado: any;
  servicioSeleccionado: any;

  constructor(
    private gService: GenericService,
    private route: ActivatedRoute,
    private router: Router,
    private noti: NotificacionService,
    private renderer: Renderer2,
    private el: ElementRef
  ) {
    let id = this.route.snapshot.paramMap.get('id');
    if (!isNaN(Number(id))) this.obtenerDetalles(Number(id));

    // Inicializar dataSource
    this.productos = new MatTableDataSource<any>([]);
    this.servicios = new MatTableDataSource<any>([]);

    if (!isNaN(Number(id))) this.obtenerDetalles(Number(id));

    //cargar los combos
    this.productosDisponibles();
    this.serviciosDisponibles();
  }

  // Método para mostrar los combos de actualización
  mostrarCombos() {
    this.actualizando = true;
  }

  // Método para cargar productos disponibles
  //Listar todos los productos del API
  productosDisponibles() {
    //localhost:3000/producto
    this.gService.list("producto/")
      .pipe(takeUntil(this.destroy$))
      .subscribe((respuesta: any) => {
        console.log(respuesta)
        this.productosApi = respuesta
      }
      )
  }

  serviciosDisponibles() {
    this.gService
      .list('servicio/')
      .pipe(takeUntil(this.destroy$))
      .subscribe((respuesta: any) => {
        console.log(respuesta);
        this.serviciosApi = respuesta;


      });
  }

  obtenerDetalles(id: any) {
    this.gService
      .get('factura', id)
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: any) => {
        this.datos = data;
        console.dir(this.datos);

        // Verificar la estructura de data.detalleFacturas
        console.log('detalleFacturas:', data.detalleFacturas);

        const productosIniciales = data.detalleFacturas.filter(
          (item: any) => item.producto
        );
        this.productos = new MatTableDataSource(productosIniciales);
        console.log('Productos iniciales después de inicializar MatTableDataSource:', this.productos.data);

        const serviciosIniciales = data.detalleFacturas.filter(
          (item: any) => item.servicio
        );
        this.servicios = new MatTableDataSource(serviciosIniciales);
        console.log('Servicios iniciales después de inicializar MatTableDataSource:', this.servicios.data);

        this.validProduct = this.productos.data.length > 0;
        this.validService = this.servicios.data.length > 0;

        if (!data.estado) {
          this.cambiarEstilo();
        }
      });
  }


  cambiarEstilo() {
    const elInvoiceHeader = this.el.nativeElement.querySelector('.factura-header');
    this.renderer.setStyle(elInvoiceHeader, 'background', 'rgb(134, 36, 36)');
  }

  regresar() {
    this.router.navigate(['/factura']);
  }

  // Método para agregar un producto a this.datos
  agregarProducto() {
    if (this.productoSeleccionado) {
      const precio = parseFloat(this.productoSeleccionado.precio); // Convertir a número
      const cantidad = 1;

      // Validar si el producto ya está en la lista
      const productoExistente = this.productos.data.find(
        (producto: any) => producto.producto.id === this.productoSeleccionado.id
      );

      if (productoExistente) {
        // Si el producto ya existe, puedes mostrar un mensaje o simplemente no agregarlo
        console.log('El producto ya está en la lista.');
        this.noti.mensaje(
          'Producto ya seleccionado',
          `No se pueden repetir productos`,
          TipoMessage.warning
        );
        return; // Salir del método sin agregar el producto
      }

      // Obtener el total para después actualizarlo
      let total = this.datos.Total;

      const nuevoProducto = {
        producto: {
          id: this.productoSeleccionado.id,
          nombre: this.productoSeleccionado.nombre,
          precio: this.productoSeleccionado.precio,
        },
        cantidad: cantidad,
        subTotal: precio * cantidad,
      };

      // Actualizar los datos existentes sin crear un nuevo MatTableDataSource
      const productosArray = [...this.productos.data, nuevoProducto];
      this.productos.data = productosArray;

      console.log('Productos actualizados:', this.productos.data);
      console.log('ValidProduct:', this.validProduct);

      // Actualizar validProduct
      this.validProduct = productosArray.length > 0;

      // Limpiar la selección
      this.productoSeleccionado = null;

      // Actualizar el total
      this.datos.Total = parseFloat(total) + precio;
    }
  }

  // Método para agregar un servicio a this.datos
  // Método para agregar un servicio a this.datos
  agregarServicio() {
    if (this.servicioSeleccionado) {
      const tarifa = parseFloat(this.servicioSeleccionado.tarifa); // Convertir a número
      const cantidad = 1;

      // Validar si el producto ya está en la lista
      const servicioExistente = this.servicios.data.find(
        (servicio: any) => servicio.servicio.id === this.servicioSeleccionado.id
      );

      if (servicioExistente) {
        // Si el producto ya existe, puedes mostrar un mensaje o simplemente no agregarlo
        console.log('El servicio ya está en la lista.');
        this.noti.mensaje(
          'Servicio ya seleccionado',
          `No se pueden repetir Servicios`,
          TipoMessage.warning
        );
        return; // Salir del método sin agregar el producto
      }

      // Obtener el total para después actualizarlo
      let total = this.datos.Total;

      const nuevoServicio = {
        servicio: {
          id: this.servicioSeleccionado.id,
          nombre: this.servicioSeleccionado.nombre,
          tarifa: this.servicioSeleccionado.tarifa
        },
        cantidad: cantidad,
        subTotal: tarifa * cantidad
      };

      // Actualizar los datos existentes sin crear un nuevo MatTableDataSource
      const servicesArray = [...this.servicios.data, nuevoServicio];
      this.servicios.data = servicesArray;

      console.log('Servicios actualizados:', this.servicios.data);
      console.log('ValidService:', this.validService);

      // Actualizar validService
      this.validService = servicesArray.length > 0;

      // Limpiar la selección
      this.servicioSeleccionado = null;

      // Actualizar el total
      this.datos.Total = parseFloat(total) + tarifa;
    }
  }



  eliminarProducto(producto: any) {
    // Filtrar el producto de la lista
    const productosActualizados = this.productos.data.filter(p => p !== producto);
    this.productos = new MatTableDataSource(productosActualizados);
    // Obtener el total para después actualizarlo
    let precioProducto = producto.producto.precio;
    console.log(producto)
    this.datos.Total -= parseFloat(precioProducto);

      // Verificar si todavía hay productos
      this.validProduct = this.productos.data.length > 0;
  }

  eliminarServicio(servicio: any) {
    // Filtrar el servicio de la lista
    const serviciosActualizados = this.servicios.data.filter(s => s !== servicio);
    this.servicios = new MatTableDataSource(serviciosActualizados);

    let precioServicio = servicio.servicio.tarifa;
    console.log(servicio)
    this.datos.Total -= parseFloat(precioServicio);

    // Verificar si todavía hay servicios
    this.validService = this.servicios.data.length > 0;
  }




  formalizarProforma() {
    // Recalcular el total basado en productos y servicios
    let total = 0;

    this.productos.data.forEach((producto: any) => {
      total += producto.subTotal;
    });

    this.servicios.data.forEach((servicio: any) => {
      total += servicio.subTotal;
    });

    // Asignar el total recalculado a this.datos.Total
    //this.datos.Total = total;

    // Preparar un array para almacenar los detalles de la factura
    const detallesFactura = [
      ...this.servicios.data.map((servicio: any) => ({
        servicio_id: servicio.servicio.id,
        producto_id: null, // Dejar nulo para los servicios
        cantidad: servicio.cantidad,
        precio: servicio.servicio.tarifa,
        subTotal: servicio.subTotal,
        impuesto: this.calcularImpuesto(servicio.subTotal), // Asegúrate de calcular el impuesto
      })),
      ...this.productos.data.map((producto: any) => ({
        servicio_id: null, // Dejar nulo para los productos
        producto_id: producto.producto.id,
        cantidad: producto.cantidad,
        precio: producto.producto.precio,
        subTotal: producto.subTotal,
        impuesto: this.calcularImpuesto(producto.subTotal), // Asegúrate de calcular el impuesto
      })),
    ];

    // Incluir los detalles de la factura en this.datos
    this.datos.detalles = detallesFactura;

    // Llamada al servicio para actualizar la factura
    this.gService
      .update('factura', this.datos)
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: any) => {
        this.noti.mensaje(
          'Factura formalizada',
          `N° #: ${data.id}`,
          TipoMessage.success
        );
        this.router.navigate(['/factura']);
      });
  }
  // Ejemplo de método para calcular el impuesto
  calcularImpuesto(subTotal: number): number {
    const tasaImpuesto = 0.13; // Ejemplo de tasa de impuesto (13%)
    return subTotal * tasaImpuesto;
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
