import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Observable, Subject, takeUntil } from 'rxjs';
import { GenericService } from '../../share/generic.service';
import { NotificacionService, TipoMessage } from '../../share/notification.service';
import { FileUploadService } from '../../share/file-upload.service';
import { HttpResponse } from '@angular/common/http';
import { FormErrorMessageProducto } from '../../form-error-message';

@Component({
  selector: 'app-producto-form',
  templateUrl: './producto-form.component.html',
  styleUrl: './producto-form.component.css'
})
export class ProductoFormComponent implements OnInit {
  destroy$: Subject<boolean> = new Subject<boolean>();
  //Titulo
  titleForm: string = 'Crear';
  //Lista de generos
  categoriaList: any;
  //Videojuego a actualizar
  productoInfo: any;
  //Respuesta del API crear/modificar
  respProducto: any;
  //Nombre del formulario
  productoForm: FormGroup;
  //id del Videojuego
  idProducto: number = 0;
  //Sí es crear
  isCreate: boolean = true;
  number4digits = /^\d{4}$/;
  //Imagenes
  currentFile?: File;
  message = '';
  preview = '';
  nameImage = 'image-not-found.jpg'
  imageInfos?: Observable<any>;
  imageUrl: string | null = null;  // Variable para almacenar la URL de la imagen seleccionada
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private activeRouter: ActivatedRoute,
    private gService: GenericService,
    private noti: NotificacionService,
    private uploadService: FileUploadService
  ) {
    this.formularioReactive();
    //this.listaGeneros();
    this.listaPlataformas();
  }
  ngOnInit(): void {
    //Verificar si se envio un id por parametro para crear formulario para actualizar
    this.activeRouter.params.subscribe((params: Params) => {
      this.idProducto = params['id']
      if (this.idProducto != undefined) {
        //Actualizar
        this.isCreate = false
        this.titleForm = 'Actualizar'
        //Obtener el videojuego del API que se va actualizar
        this.gService
          .get('producto', this.idProducto)
          .pipe(takeUntil(this.destroy$))
          .subscribe((data: any) => {
            console.log(data);
            this.productoInfo = data;


            //Asignar valores al formulario
            this.productoForm.patchValue({
              id: this.productoInfo.id,
              nombre: this.productoInfo.nombre,
              descripcion: this.productoInfo.descripcion,
              precio: this.productoInfo.precio,
              marca: this.productoInfo.marca,
              uso: this.productoInfo.uso,
              imagen: this.productoInfo.imagen,
              //categoria: this.productoInfo.categoria,
            })
            this.nameImage = this.productoInfo.imagen
            //Armar los datos a mostrar en el formulario
            //categoria

            this.setInitialCategorias([this.productoInfo.categoria])
          });
      }
    })
  }
  /* La función trackById se utiliza en Angular con la directiva 
  *ngFor para mejorar el rendimiento de la lista al rastrear 
  los elementos por una propiedad única, como el id. Esta función 
  ayuda a Angular a identificar de manera más eficiente qué elementos 
  han cambiado, agregado o eliminado de una lista, lo que puede mejorar 
  el rendimiento de la aplicación. */
  trackById(index: number, item: any): number {
    return item.id;
  }

  //Crear Formulario
  formularioReactive() {
    let number2decimals = /^[0-9]+[.,]{1,1}[0-9]{2,2}$/;
    //[null, Validators.required]
    this.productoForm = this.fb.group({
      id: [null, null],
      nombre: [null,
        Validators.compose([
          Validators.required,
          Validators.minLength(2)
        ])],
      descripcion: [null, Validators.required],
      precio: [null, Validators.compose([
        Validators.required,
        Validators.pattern(number2decimals)
      ])
      ],
      marca: [null, Validators.required],
      uso: [null, Validators.required],
      categoria_id: [Validators.required],
      categoriaArray: this.fb.array([]),
      imagen: [this.nameImage, Validators.required],
    });
  }
  // Método para establecer valores iniciales
  //Asegúramos de que setInitialCategorias pueda manejar tanto arrays como objetos.
  setInitialCategorias(categorias: any[]): void {
    // Limpiar el FormArray existente
    this.categoriaArray.clear();
    categorias.forEach((categoria_id) => this.categoriaArray.push(this.fb.group(categoria_id)));
  }
  addCategoria() {
    // Verificar si ya hay una categoría en el array
    if (this.categoriaArray.length >= 1) {
      // Mostrar un mensaje al usuario si ya hay una categoría seleccionada
      this.noti.mensaje('Categoría', 
        'Solo se puede seleccionar una categoría',
         TipoMessage.warning);
      return;
    }
    const item = this.fb.group({
      nombre: [
        null,
        Validators.compose([
          Validators.required,
          Validators.pattern(this.number4digits),
        ]),
      ],
      id: [1, [Validators.required]],
    });

    //verificar que solo se tenga una categoria 
    // Agregar un nuevo grupo a FormArray
    this.categoriaArray.push(item);
  }
  removeCategoria(i: number) {
    this.categoriaArray.removeAt(i);
  }
  // Obtener el FormArray de las plataformas
  get categoriaArray(): FormArray {
    return this.productoForm.get('categoriaArray') as FormArray;
  }
  /* listaGeneros () {
     this.generosList = null;
     this.gService
       .list('genero')
       .pipe(takeUntil(this.destroy$))
       .subscribe((data: any) => {
         // console.log(data);
         this.generosList = data;
       });
   }*/
  listaPlataformas() {
    this.categoriaList = null;
    this.gService
      .list('categoria')
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: any) => {
        console.log(data);
        this.categoriaList = data;
      });
  }

  public errorHandling = (controlName: string) => {
    let messageError = '';
    const control = this.productoForm.get(controlName);
    if (control.errors) {
      for (const message of FormErrorMessageProducto) {
        if (
          control &&
          control.errors[message.forValidator] &&
          message.forControl == controlName
        ) {
          messageError = message.text;
        }
      }
      return messageError;
    } else {
      return false;
    }
  };

  submitPProducto(): void {
    //Verificar validación
    //revisar esto
    /* if (this.productoForm.invalid) {
      console.log("No sirve")
      console.log(this.productoForm.value)

      return;
    } */
    console.log(this.productoForm.value);
    //Subir imagen
    if (this.upload()) {
      this.noti.mensaje(
        'Crear Producto',
        'Imagen guardada',
        TipoMessage.success
      )
    }

    const productoData = {
      ...this.productoForm.value,
      //  precio: this.acoplarPrecio(this.productoForm.value.precio_producto),
      imagen: this.nameImage,
    };

    //Datos a guardar en videojuego
    //Generos
    //let generosForm = this.videojuegoForm.get('generos').value.map((x: any) => ({ ['id']: x }))
    //Precio con decimales
    let tarifaVar = parseFloat(this.productoForm.get('precio').value).toFixed(2)

    let categoriaArray = this.productoForm.get('categoriaArray').value;
    let categoria_id = categoriaArray.length > 0 ? categoriaArray[0].id : null; // Extrae el id de la primera categoría


    //Asignar los valores correctos al formulario patchValue setValue
    this.productoForm.patchValue({
      // generos: generosForm,
      categoria_id: categoria_id, // Enviar solo el id de la categoría    
      tarifa: tarifaVar,
      imagen: this.nameImage
    })
    console.log(this.productoForm.value)
    //Guardar videojuego
    this.guardarProducto()
  }
  guardarProducto() {
    if (this.isCreate) {
      //Accion API create enviando toda la informacion del formulario
      this.gService
        .create('producto', this.productoForm.value)
        .pipe(takeUntil(this.destroy$))
        .subscribe((data: any) => {
          //Obtener respuesta
          this.respProducto = data;
          this.noti.mensajeRedirect(
            'Crear producto',
            `Producto creado: ${data.nombre}`,
            TipoMessage.success,
            'producto'
          );
          this.router.navigate(['/producto']);
        });
    } else {
      //Accion API actualizar enviando toda la informacion del formulario
      this.gService
        .update('producto', this.productoForm.value)
        .pipe(takeUntil(this.destroy$))
        .subscribe((data: any) => {
          //Obtener respuesta
          this.respProducto = data;

          this.noti.mensajeRedirect(
            'Actualizar Producto',
            `Producto actualizado: ${data.nombre}`,
            TipoMessage.success,
            'producto'
          );
          this.router.navigate(['/producto']);
        });
    }
  }
  onReset() {
    this.productoForm.reset();
  }
  onBack() {
    this.router.navigate(['/producto']);
  }
  ngOnDestroy() {
    this.destroy$.next(true);
    // Desinscribirse
    this.destroy$.unsubscribe();
  }
  selectFile(event: any): void {
    this.message = '';
    this.preview = '';
    const selectedFiles = event.target.files;

    if (selectedFiles) {
      const file: File | null = selectedFiles.item(0);

      if (file) {
        this.preview = '';
        this.currentFile = file;
        this.nameImage = this.currentFile.name
        const reader = new FileReader();

        reader.onload = (e: any) => {
          console.log(e.target.result);
          this.preview = e.target.result;
        };

        reader.readAsDataURL(this.currentFile);
      }
    }
  }
  upload(): boolean {
    if (this.currentFile) {

      this.uploadService.upload(this.currentFile).subscribe({
        next: (event: any) => {
          if (event instanceof HttpResponse) {
            this.message = event.body.message;
            this.imageInfos = this.uploadService.getFiles();
          }
          return true;
        },
        error: (err: any) => {
          console.log(err);

          if (err.error && err.error.message) {
            this.message = err.error.message;
          } else {
            this.message = '¡No se pudo subir la imagen!';
            this.noti.mensajeRedirect('Foto', this.message,
              TipoMessage.warning,
              'producto');
          }
          return false;
        },
        complete: () => {

          this.currentFile = undefined;
        },
      });
    }
    return false
  }
}