import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Observable, Subject, takeUntil } from 'rxjs';
import { GenericService } from '../../share/generic.service';
import { NotificacionService, TipoMessage } from '../../share/notification.service';
import { FileUploadService } from '../../share/file-upload.service';
import { HttpResponse } from '@angular/common/http';
import { FormErrorMessageSucursal } from '../../form-error-message';

@Component({
  selector: 'app-sucursal-form',
  templateUrl: './sucursal-form.component.html',
  styleUrl: './sucursal-form.component.css'
})
export class SucursalFormComponent {
  destroy$: Subject<boolean> = new Subject<boolean>();
  //Titulo
  titleForm: string = 'Crear';
  //Lista de encargados
  encargadosList: any;
  //Videojuego a actualizar
  SucursalInfo: any;
  //Respuesta del API crear/modificar
  respSucursal: any;
  //Nombre del formulario
  sucursalForm: FormGroup;
  //id del Videojuego
  idSucursal: number = 0;
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
    this.listaEncargados();
  }
  ngOnInit(): void {
    //Verificar si se envio un id por parametro para crear formulario para actualizar
    this.activeRouter.params.subscribe((params: Params) => {
      this.idSucursal = params['id']
      if (this.idSucursal != undefined) {
        //Actualizar
        this.isCreate = false
        this.titleForm = 'Actualizar'
        //Obtener el videojuego del API que se va actualizar
        this.gService
          .get('sucursal', this.idSucursal)
          .pipe(takeUntil(this.destroy$))
          .subscribe((data: any) => {
            console.log(data);
            this.SucursalInfo = data;


            //Asignar valores al formulario
            this.sucursalForm.patchValue({
              id: this.SucursalInfo.id,
              nombre: this.SucursalInfo.nombre,
              descripcion: this.SucursalInfo.descripcion,
              telefono: this.SucursalInfo.telefono,
              direccion: this.SucursalInfo.direccion,
              email: this.SucursalInfo.email,
              //imagen: this.SucursalInfo.imagen,
              //categoria: this.productoInfo.categoria,
            })
            //this.nameImage = this.SucursalInfo.imagen
            //Armar los datos a mostrar en el formulario
            //categoria
            //agregamos [] si en la llamada del api viene como objeto
            this.listaEncargados();
            this.setInitialEncargados(this.SucursalInfo.encargados || []);
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
    let soloNumeros = /^[0-9]+$/;
    //[null, Validators.required]
    this.sucursalForm = this.fb.group({
      id: [null, null],
      nombre: [null,
        Validators.compose([
          Validators.required,
          Validators.minLength(2)
        ])],
      descripcion: [null, Validators.required],
      telefono: [null, Validators.compose([
        Validators.required,
        Validators.pattern(soloNumeros)
      ])
      ],
      direccion: [null, Validators.required],
      email: [null, Validators.required],
     // sucursalId: [Validators.required],
      encargadoId: [Validators.required],
      encargadoArray: this.fb.array([])
    });
  }
  // Método para establecer valores iniciales
  //Asegúramos de que setInitialCategorias pueda manejar tanto arrays como objetos.
  setInitialEncargados(encargados: any[]): void {
    this.encargadoArray.clear();
    
    // Asegúrate de que encargados es un array de objetos con la estructura correcta
    if (Array.isArray(encargados)) {
      encargados.forEach((encargado) => {
        this.encargadoArray.push(this.fb.group({
          id: [encargado.id, Validators.required],
          nombre: [encargado.nombre || '', Validators.required] // O ajusta según la estructura de tus datos
        }));
      });
    }
  }
  
  addEncargado() {
    // Verificar si ya hay una categoría en el array
    if (this.encargadoArray.length >= 1) {
      // Mostrar un mensaje al usuario si ya hay una categoría seleccionada
      this.noti.mensaje('Encargado',
        'Solo se puede seleccionar un Encargado',
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
      sucursalId: [1, [Validators.required]],
      id: [
        null,
        Validators.compose([
          Validators.required,
          Validators.pattern(this.number4digits),
        ]),
      ],
    });

    //verificar que solo se tenga una categoria 
    // Agregar un nuevo grupo a FormArray
    this.encargadoArray.push(item);
  }
  removeCategoria(i: number) {
    this.encargadoArray.removeAt(i);
  }
  // Obtener el FormArray de las plataformas
  get encargadoArray(): FormArray {
    return this.sucursalForm.get('encargadoArray') as FormArray;
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
       listaEncargados() {
        this.encargadosList = null;
      
        this.gService.list('usuario').pipe(takeUntil(this.destroy$)).subscribe((data: any) => {
          console.log(data);
      
          // Filtrar encargados sin sucursal
          const encargadosSinSucursal = data.filter((usuario: any) =>
            usuario.role === 'ENCARGADO' && usuario.sucursalId === null
          );
      
          // Verificar si estamos en modo de actualización
          if (!this.isCreate && this.SucursalInfo && this.SucursalInfo.encargados) {
            const encargadoEnlazado = this.SucursalInfo.encargados[0]; // Suponiendo que solo hay un encargado enlazado
      
            // Encontrar el encargado enlazado en los datos obtenidos
            const encargadoEnlazadoData = data.find((usuario: any) => usuario.id === encargadoEnlazado.id);
      
            // Agregar el encargado enlazado a la lista de encargados sin sucursal
            if (encargadoEnlazadoData && !encargadosSinSucursal.find((usuario: any) => usuario.id === encargadoEnlazadoData.id)) {
              this.encargadosList = [...encargadosSinSucursal, encargadoEnlazadoData];
            } else {
              this.encargadosList = encargadosSinSucursal;
            }
          } else {
            // Solo mostrar los encargados sin sucursal si estamos creando una nueva sucursal
            this.encargadosList = encargadosSinSucursal;
          }
      
          console.log(this.encargadosList);
        });
      }
      
      
      

  public errorHandling = (controlName: string) => {
    let messageError = '';
    const control = this.sucursalForm.get(controlName);
    if (control.errors) {
      for (const message of FormErrorMessageSucursal) {
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

  submitSucursal(): void {
    //Verificar validación
    //revisar esto
    /* if (this.productoForm.invalid) {
      console.log("No sirve")
      console.log(this.productoForm.value)

      return;
    } */
    console.log(this.sucursalForm.value);
    //Subir imagen
    /* if (this.upload()) {
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
    }; */

    //Datos a guardar en videojuego
    //Generos
    //let generosForm = this.videojuegoForm.get('generos').value.map((x: any) => ({ ['id']: x }))
    //Precio con decimales
    //let precioVar = parseFloat(this.sucursalForm.get('precio').value).toFixed(2)

    let encargadoArray = this.sucursalForm.get('encargadoArray').value;
    let encargado_id = encargadoArray.length > 0 ? encargadoArray[0].sucursalId : null; // Extrae el id de la primera categoría


    //Asignar los valores correctos al formulario patchValue setValue
    this.sucursalForm.patchValue({
      // generos: generosForm,
      encargado_id: encargado_id, // Enviar solo el id de la categoría    
      //precio: precioVar,
      //imagen: this.nameImage
    })
    console.log(this.sucursalForm.value)
    //Guardar videojuego
    this.guardarSucursal()
  }
  guardarSucursal() {
    if (this.isCreate) {
      //Accion API create enviando toda la informacion del formulario
      this.gService
        .create('sucursal', this.sucursalForm.value)
        .pipe(takeUntil(this.destroy$))
        .subscribe((data: any) => {
          //Obtener respuesta
          this.respSucursal = data;
          this.noti.mensajeRedirect(
            'Crear Sucursal',
            `Sucursal creado: ${data.nombre}`,
            TipoMessage.success,
            'sucursal'
          );
          this.router.navigate(['/sucursal']);
        });
    } else {
      //Accion API actualizar enviando toda la informacion del formulario
      this.gService
        .update('sucursal', this.sucursalForm.value)
        .pipe(takeUntil(this.destroy$))
        .subscribe((data: any) => {
          //Obtener respuesta
          this.respSucursal = data;

          this.noti.mensajeRedirect(
            'Actualizar Sucursal',
            `Sucursal actualizado: ${data.nombre}`,
            TipoMessage.success,
            'sucursal'
          );
          this.router.navigate(['/sucursal']);
        });
    }
  }
  onReset() {
    this.sucursalForm.reset();
  }
  onBack() {
    this.router.navigate(['/sucursal']);
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
