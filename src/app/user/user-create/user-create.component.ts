import { Component, OnInit } from '@angular/core';
import { FormErrorMessage } from '../../form-error-message';
import { Subject, takeUntil } from 'rxjs';
import { NotificacionService, TipoMessage } from '../../share/notification.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthenticationService } from '../../share/authentication.service';
import { GenericService } from '../../share/generic.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-create',
  templateUrl: './user-create.component.html',
  styleUrl: './user-create.component.css'
})
export class UserCreateComponent implements OnInit {
  hide = true;
  usuario: any;
  roles: any;
  formCreate: FormGroup;
  makeSubmit: boolean = false;
  destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(
    public fb: FormBuilder,
    private router: Router,
    private gService: GenericService,
    private authService: AuthenticationService,
    private notificacion: NotificacionService
  ) {
    this.reactiveForm();
  }

  reactiveForm() {
    this.formCreate = this.fb.group({
      nombre: ['', [Validators.required]],
      email: ['', [Validators.required]],
      password: ['', [Validators.required]],
      // role: ['', [Validators.required]],
      tel: ['', [Validators.required]],
      fecha: ['', [Validators.required]],
    });
    // this.getRoles();
  }
  
  ngOnInit(): void {}

  submitForm() {
    this.makeSubmit = true;
    //Validación
    if (this.formCreate.invalid) {
      return;
    }

    const formValue = this.formCreate.value;
    const fechaFormato = formValue.fecha.toISOString();

    const usuarioDatos = {
      ...formValue,
      fecha : fechaFormato,
      rol: 'CLIENT'
    };

    //Crear usuario
    this.authService.createUser(usuarioDatos)
    .subscribe((respuesta:any)=>{
      this.notificacion.mensajeRedirect(
        'Registrar usuario',
        'Usuario Creado',
        TipoMessage.success,
        '/usuario/login'
      )
      this.router.navigate(['/usuario/login'])
    })
  }

  onReset() {
    this.formCreate.reset();
  }
  
  // getRoles() {
  //   this.gService
  //     .list('rol')
  //     .pipe(takeUntil(this.destroy$))
  //     .subscribe((data: any) => {
  //       console.dir(data);
  //       this.roles = data.filter(item => {return item.id !== 'ADMIN'});
  //     });
  // }
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