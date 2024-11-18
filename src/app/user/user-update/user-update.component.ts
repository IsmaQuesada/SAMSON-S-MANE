import { Component, OnInit } from '@angular/core';
import { FormErrorMessage } from '../../form-error-message';
import { Subject, takeUntil } from 'rxjs';
import { NotificacionService, TipoMessage } from '../../share/notification.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthenticationService } from '../../share/authentication.service';
import { GenericService } from '../../share/generic.service';
import { ActivatedRoute, Params, Router } from '@angular/router';

@Component({
  selector: 'app-user-update',
  templateUrl: './user-update.component.html',
  styleUrl: './user-update.component.css'
})
export class UserUpdateComponent implements OnInit {
  hide = true;
  usuario: any;
  roles: any;
  formCreate: FormGroup;
  makeSubmit: boolean = false;
  destroy$: Subject<boolean> = new Subject<boolean>();
  idUsuario: number = 0;
  usuarioData: any;
  respServicio: any;

  constructor(
    public fb: FormBuilder,
    private router: Router,
    private gService: GenericService,
    private authService: AuthenticationService,
    private notificacion: NotificacionService,
    private activeRouter: ActivatedRoute,
  ) {
    this.reactiveForm();
  }

  reactiveForm() {
    this.formCreate = this.fb.group({
      nombre: ['', [Validators.required]],
      email: ['', [Validators.required]],
      password: [''],
      tel: ['', [Validators.required]],
      fecha: ['', [Validators.required]],
      role: ['', [Validators.required]],
    });
    this.getRoles();
  }
  
  ngOnInit(): void {
        //Verificar si se envio un id por parametro para crear formulario para actualizar
        this.activeRouter.params.subscribe((params: Params) => {
          this.idUsuario = params['id']
          if (this.idUsuario != undefined) {
            //Obtener el videojuego del API que se va actualizar
            this.gService
              .get('usuario', this.idUsuario)
              .pipe(takeUntil(this.destroy$))
              .subscribe((data: any) => {
                console.log(data);
                this.usuarioData = data;
    
    
                //Asignar valores al formulario
                this.formCreate.patchValue({
                  id: this.usuarioData.id,
                  email: this.usuarioData.email,
                  fecha: this.usuarioData.fechaNacimiento,
                  nombre: this.usuarioData.nombre,
                  role: this.usuarioData.role,
                  tel: this.usuarioData.telefono
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

  submitForm() {
    this.makeSubmit = true;
    //Validación
    if (this.formCreate.invalid) {
      return;
    }

    const formValue = this.formCreate.value;

    const usuarioDatos = {
      ...formValue,
      id: this.idUsuario,
    };

    //Crear usuario
    this.gService
        .update('usuario', usuarioDatos)
        .pipe(takeUntil(this.destroy$))
        .subscribe((data: any) => {
          //Obtener respuesta
          this.respServicio = data;

          this.notificacion.mensaje(
            'Actualizar Servicio',
            `Usuario actualizado: ${data.nombre}`,
            TipoMessage.success
          );

          this.router.navigate(['/listaUsuarios']);
        });
  }

  onReset() {
    this.formCreate.reset();
  }
  
  getRoles() {
    this.gService
      .list('rol')
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: any) => {
        console.dir(data);
        this.roles = data.filter(item => {return item.id !== 'ADMIN'});
      });
  }
  /* Manejar errores de formulario en Angular */

  public errorHandling = (controlName: string) => {
    let messageError = '';
    const control = this.formCreate.get(controlName);
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
}