import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Observable, Subject, takeUntil } from 'rxjs';
import { GenericService } from '../../share/generic.service';
import { HttpResponse } from '@angular/common/http';
import { NotificacionService, TipoMessage } from '../../share/notification.service';
import { FileUploadService } from '../../share/file-upload.service';
import { FormErrorMessage } from '../../form-error-message';

@Component({
  selector: 'app-servicio-form',
  templateUrl: './servicio-form.component.html',
  styleUrl: './servicio-form.component.css'
})
export class ServicioFormComponent {
  destroy$: Subject<boolean> = new Subject<boolean>();
  //Titulo
  titleForm: string = 'Crear';
  //Lista de generos
  generosList: any;
  //Lista de plataformas
  plataformaList: any;
  //Videojuego a actualizar
  servicioInfo: any;
  //Respuesta del API crear/modificar
  respServicio: any;
  //Nombre del formulario
  servicioForm: FormGroup;
  //id del Videojuego
  idServicio: number = 0;
  //Sí es crear
  isCreate: boolean = true;
  number4digits = /^\d{4}$/;
  //Imagenes
  currentFile?: File;
  message = '';
  preview = '';
  nameImage = 'image-not-found.jpg'
  imageInfos?: Observable<any>;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private activeRouter: ActivatedRoute,
    private gService: GenericService,
    private noti: NotificacionService,
    private uploadService: FileUploadService
  ) {
    this.formularioReactive();
  }
  ngOnInit(): void {
    //Verificar si se envio un id por parametro para crear formulario para actualizar
    this.activeRouter.params.subscribe((params: Params) => {
      this.idServicio = params['id']
      if (this.idServicio != undefined) {
        //Actualizar
        this.isCreate = false
        this.titleForm = 'Actualizar'
        //Obtener el videojuego del API que se va actualizar
        this.gService
          .get('servicio', this.idServicio)
          .pipe(takeUntil(this.destroy$))
          .subscribe((data: any) => {
            console.log(data);
            this.servicioInfo = data;


            //Asignar valores al formulario
            this.servicioForm.patchValue({
              id: this.servicioInfo.id,
              nombre: this.servicioInfo.nombre,
              descripcion: this.servicioInfo.descripcion,
              tarifa: this.servicioInfo.tarifa,
              tiempoServicio: this.servicioInfo.tiempoServicio,
              requisitosPrevios: this.servicioInfo.requisitosPrevios,
              Precauciones: this.servicioInfo.Precauciones,
            })
            // this.nameImage = this.servicioInfo.imagen
            //Armar los datos a mostrar en el formulario
            //Plataformas
            /* let plataformaValue=this.videojuegoInfo.plataformas.map(
              (item:any)=>({
                ['id']: item.plataforma.id,
                ['anno_lanzamiento']:item.anno_lanzamiento
              })
            )
            this.setInitialPlataformas( plataformaValue) */
          });
      }
    })
  }
  //Crear Formulario
  formularioReactive() {
    let number2decimals = /^[0-9]+[.,]{1,1}[0-9]{2,2}$/;
    //[null, Validators.required]
    this.servicioForm = this.fb.group({
      id: [null, null],
      nombre: [null,
        Validators.compose([
          Validators.required,
          Validators.minLength(2)
        ])],
      descripcion: [null, Validators.required],
      tarifa: [null, Validators.compose([
        Validators.required,
        Validators.pattern(number2decimals)
      ])
      ],
      tiempoServicio: [null, Validators.compose([
        Validators.required,
        Validators.pattern(/^[0-9]+$/)  // Asegurarse de que solo se acepten números enteros
      ])],
      requisitosPrevios: [null, Validators.required],
      Precauciones: [null, Validators.required],

    });
  }
  // Método para establecer valores iniciales
  /* setInitialPlataformas(plataformasValue: any): void {
    plataformasValue.forEach((p) => this.plataformas.push(this.fb.group(p)));
  } */
  /* addPlataforma() {
    const item = this.fb.group({
      anno_lanzamiento: [
        2024,
        Validators.compose([
          Validators.required,
          Validators.pattern(this.number4digits),
        ]),
      ],
      id: [1, [Validators.required]],
    });

    // Agregar un nuevo grupo a FormArray
    // this.plataformas.push(item);
  } */
  // removePlataforma(i: number) {
  //   this.plataformas.removeAt(i);
  // }
  // Obtener el FormArray de las plataformas
  /* get plataformas(): FormArray {
    return this.videojuegoForm.get('plataformas') as FormArray;
  } */
  /* listaGeneros () {
     this.generosList = null;
     this.gService
       .list('genero')
       .pipe(takeUntil(this.destroy$))
       .subscribe((data: any) => {
         // console.log(data);
         this.generosList = data;
       });
   }
   listaPlataformas() {
     this.plataformaList = null;
     this.gService
       .list('plataforma')
       .pipe(takeUntil(this.destroy$))
       .subscribe((data: any) => {
         // console.log(data);
         this.plataformaList = data;
       });
   } */

  public errorHandling = (controlName: string) => {
    let messageError = '';
    const control = this.servicioForm.get(controlName);
    if (control.errors) {
      for (const message of FormErrorMessage) {
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

  submitServicio(): void {
    //Verificar validación
    if (this.servicioForm.invalid) {
      return;
    }
    console.log(this.servicioForm.value);
    //Subir imagen
    /* if (this.upload()) {
      this.noti.mensaje(
        'Crear servicio'
        TipoMessage.success
      )
    } */
    //Datos a guardar en videojuego
    //Generos
    //let generosForm = this.videojuegoForm.get('generos').value.map((x: any) => ({ ['id']: x }))
    //Precio con decimales
    let tarifaVar = parseFloat(this.servicioForm.get('tarifa').value).toFixed(2)
    let tiempoServicioVar = parseInt(this.servicioForm.get('tiempoServicio').value)

    //Asignar los valores correctos al formulario patchValue setValue
    this.servicioForm.patchValue({
      // generos: generosForm,
      tiempoServicio: tiempoServicioVar,
      tarifa: tarifaVar,
      // imagen: this.nameImage
    })
    console.log(this.servicioForm.value)
    //Guardar videojuego
    this.guardarServicio()
  }
  guardarServicio() {
    if (this.isCreate) {
      //Accion API create enviando toda la informacion del formulario
      this.gService
        .create('servicio', this.servicioForm.value)
        .pipe(takeUntil(this.destroy$))
        .subscribe((data: any) => {
          //Obtener respuesta
          this.respServicio = data;
          this.noti.mensajeRedirect(
            'Crear servicio',
            `Servicio creado: ${data.nombre}`,
            TipoMessage.success,
            'servicio'
          );
          this.router.navigate(['/servicio']);
        });
    } else {
      //Accion API actualizar enviando toda la informacion del formulario
      this.gService
        .update('servicio', this.servicioForm.value)
        .pipe(takeUntil(this.destroy$))
        .subscribe((data: any) => {
          //Obtener respuesta
          this.respServicio = data;

          this.noti.mensajeRedirect(
            'Actualizar Servicio',
            `Servicio actualizado: ${data.nombre}`,
            TipoMessage.success,
            'servicio'
          );
          this.router.navigate(['/servicio']);
        });
    }
  }
  onReset() {
    this.servicioForm.reset();
  }
  onBack() {
    this.router.navigate(['/servicio']);
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
              'videojuego-table');
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

