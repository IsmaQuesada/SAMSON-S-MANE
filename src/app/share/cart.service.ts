import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

export class ItemCart {
  idItem: number;
  compra: any;
  cantidad: number;
  precio: number;
  subtotal: number;
  tipo: boolean;
}
@Injectable({
  providedIn: 'root',
})
export class CartService {
  private cart = new BehaviorSubject<ItemCart[]>(null);
  public currentDataCart$ = this.cart.asObservable();
  public qtyItems = new Subject<number>();
  public total = new Subject<number>();
  public totalProductos = new Subject<number>();
  public totalServicios = new Subject<number>();

  constructor() {
    //Obtener los datos de la variable orden guardada en el localStorage
    this.cart = new BehaviorSubject<any>(
      JSON.parse(localStorage.getItem('orden'))
    );
    //Establecer un observable para los datos del carrito
    this.currentDataCart$ = this.cart.asObservable();
  }

  saveCart(): void {
    localStorage.setItem('orden', JSON.stringify(this.cart.getValue()));
  }

  addToCart(compra: any, tipo: boolean) {
    const newItem = new ItemCart();
    newItem.idItem = compra.id | compra.idItem;

    if (compra.tarifa && !tipo) {
      newItem.precio = compra.tarifa;
    } else {
      newItem.precio = compra.precio;
    }

    newItem.compra = compra;
    newItem.tipo = tipo;

    newItem.cantidad = 1;
    newItem.subtotal = this.calculoSubtotal(newItem);

    let listCart = this.cart.getValue();
    if (listCart) {
      let objIndex = listCart.findIndex((obj) => obj.idItem == newItem.idItem);
      if (objIndex != -1) {
        if (compra.hasOwnProperty('cantidad')) {
          if (compra.cantidad <= 0) {
            this.removeFromCart(newItem);
            return;
          } else {
            listCart[objIndex].cantidad = compra.cantidad;
          }
        } else {
          listCart[objIndex].cantidad += 1;
        }
        newItem.cantidad = listCart[objIndex].cantidad;
        listCart[objIndex].subtotal = this.calculoSubtotal(newItem);
      } else {
        listCart.push(newItem);
      }
    } else {
      listCart = [];
      listCart.push(newItem);
    }
    this.cart.next(listCart);
    this.qtyItems.next(this.quantityItems());
    this.total.next(this.calculoTotal());
    this.totalProductos.next(this.calculoTotalProductos());
    this.totalServicios.next(this.calculoTotalServicios());
    this.saveCart();
  }

  //Calcula el subtotal del item del carrito que se indique
  private calculoSubtotal(item: ItemCart) {
    return item.precio * item.cantidad;
  }

  //Elimina un elemento del carrito
  public removeFromCart(newData: ItemCart) {
    let listCart = this.cart.getValue();
    let objIndex = listCart.findIndex((obj) => obj.idItem == newData.idItem);
    if (objIndex != -1) {
      listCart.splice(objIndex, 1);
    }
    this.cart.next(listCart);
    this.qtyItems.next(this.quantityItems());
    this.total.next(this.calculoTotal());
    this.totalProductos.next(this.calculoTotalProductos());
    this.totalServicios.next(this.calculoTotalServicios());
    this.saveCart();
  }

  //Obtener todos los items del carrito
  get getItems() {
    return this.cart.getValue();
  }

  //Gestiona el conteo de los items del carrito como un Observable
  get countItems(): Observable<number> {
    this.qtyItems.next(this.quantityItems());
    return this.qtyItems.asObservable();
  }

  quantityItems() {
    let listCart = this.cart.getValue();
    let sum = 0;
    if (listCart != null) {
      //Sumando las cantidades de cada uno de los items del carrito
      listCart.forEach((obj) => {
        sum += obj.cantidad;
      });
    }
    return sum;
  }

  //Calcula y retorna el total de los items del carrito
  public calculoTotalProductos(): number {
    let totalCalc = 0;
    let listCart = this.cart.getValue();
    if (listCart != null) {
      // Filtrar productos (tipo 1) y calcular el total
      const productos = listCart.filter((item: ItemCart) => item.tipo === true);
      productos.forEach((item: ItemCart) => {
        totalCalc += item.subtotal;
      });
    }

    return totalCalc;
  }

  public calculoTotalServicios(): number {
    let totalCalc = 0;
    let listCart = this.cart.getValue();
    if (listCart != null) {
      // Filtrar servicios (tipo 0) y calcular el total
      const servicios = listCart.filter(
        (item: ItemCart) => item.tipo === false
      );
      servicios.forEach((item: ItemCart) => {
        totalCalc += item.subtotal;
      });
    }

    return totalCalc;
  }

  public calculoTotal(): number {
    let totalCalc = 0;
    let listCart = this.cart.getValue();
    if (listCart != null) {
      listCart.forEach((item: ItemCart, index) => {
        totalCalc += item.subtotal;
      });
    }
    return totalCalc;
  }

  get getTotal(): Observable<number> {
    this.total.next(this.calculoTotal())
    return this.total.asObservable();
  }

  get getTotalServicios(): Observable<number> {
    this.totalServicios.next(this.calculoTotalServicios())
    return this.totalServicios.asObservable();
  }

  get getTotalProductos(): Observable<number> {
    this.totalProductos.next(this.calculoTotalProductos())
    return this.totalProductos.asObservable();
  }

  //Borra toda los items del carrito
  public deleteCart() {
    this.cart.next(null);
    this.qtyItems.next(0);
    this.total.next(0);
    this.totalProductos.next(0);
    this.totalServicios.next(0);
    this.saveCart();
  }
}
