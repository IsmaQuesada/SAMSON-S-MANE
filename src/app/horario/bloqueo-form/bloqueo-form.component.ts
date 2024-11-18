import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { GenericService } from '../../share/generic.service';
import {
  NotificacionService,
  TipoMessage,
} from '../../share/notification.service';
import { FormErrorMessageHorarios } from '../../form-error-message';
import { format } from 'date-fns';

@Component({
  selector: 'app-bloqueo-form',
  templateUrl: './bloqueo-form.component.html',
  styleUrl: './bloqueo-form.component.css',
})
export class BloqueoFormComponent implements OnInit {
  destroy$: Subject<boolean> = new Subject<boolean>();
  //Titulo
  titleForm: string = 'Crear';
  datos: any;
  //Lista de generos
  sucursalesList: any;
  //Videojuego a actualizar
  bloqueoInfo: any;
  //Respuesta del API crear/modificar
  respbloqueo: any;
  //Nombre del formulario
  bloqueoForm: FormGroup;
  //id del Videojuego
  idbloqueo: number = 0;
  //Sí es crear
  isCreate: boolean = true;

  diasSemana = [
    'Lunes',
    'Martes',
    'Miercoles',
    'Jueves',
    'Viernes',
    'Sabado',
    'Domingo',
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private activeRouter: ActivatedRoute,
    private gService: GenericService,
    private noti: NotificacionService
  ) {
    this.formularioReactive();
    this.ListaSucursales();
  }

  ngOnInit(): void {
    //Verificar si se envio un id por parametro para crear formulario para actualizar
    this.activeRouter.params.subscribe((params: Params) => {
      this.idbloqueo = params['id'];
      if (this.idbloqueo != undefined) {
        //Actualizar
        this.isCreate = false;
        this.titleForm = 'Actualizar';

        this.gService
          .get('bloqueo', this.idbloqueo)
          .pipe(takeUntil(this.destroy$))
          .subscribe((data: any) => {
            console.log(data);
            this.bloqueoInfo = data;

            //Asignar valores al formulario
            this.bloqueoForm.patchValue({
              id: this.bloqueoInfo.id,
              sucursales: this.bloqueoInfo.sucursal.map(({ id }) => id),
              dias: this.bloqueoInfo.dias.map(({ id }) => id),
              fecha: this.bloqueoInfo.fecha,
              horaInicio: this.bloqueoInfo.horaInicio,
              horaFin: this.bloqueoInfo.horaFin,
            });
          });
      }
    });
  }

  VerificarHorarios(data: any): boolean {
    const { dias, fecha, horaInicio, horaFin } = data;

    // Obtener los horarios existentes desde `this.datos`
    const horarios = this.datos.horarios || [];

    // Convertir la fecha proporcionada a un objeto Date en formato ISO
    const nuevaFechaISO = new Date(`${fecha}T00:00:00.000Z`);
    const nuevaHoraInicio = new Date(horaInicio);
    const nuevaHoraFin = new Date(horaFin);

    // Normalizar la fecha de la entrada para la comparación
    function normalizeDate(dateString: string): Date {
      return new Date(dateString);
    }

    // Verificar solapamientos
    for (const horario of horarios) {
      // Convertir la fecha del horario existente a un objeto Date en formato ISO
      const horarioFechaISO = normalizeDate(horario.fecha);
      const horarioHoraInicio = normalizeDate(horario.hora_inicio);
      const horarioHoraFin = normalizeDate(horario.hora_fin);

      if (
        horario.dia_semana === dias &&
        horarioFechaISO.getTime() === nuevaFechaISO.getTime()
      ) {
        if (
          this.isOverlapping(
            nuevaHoraInicio,
            nuevaHoraFin,
            horarioHoraInicio,
            horarioHoraFin
          )
        ) {
          this.noti.mensaje(
            'Error de Bloqueos',
            'El nuevo bloqueo se sobrepone con un horario existente.',
            TipoMessage.error
          );
          return false;
        }
      }
    }
    return true;
  }

  isOverlapping(start1: Date, end1: Date, start2: Date, end2: Date): boolean {
    return start1 < end2 && end1 > start2;
  }

  VerificarBloqueos(data: any): boolean {
    const { dias, fecha, horaInicio, horaFin } = data;

    // Obtener los bloqueos existentes desde `this.datos`
    const bloqueos = this.datos.DiasBloqueados || [];

    // Convertir la fecha proporcionada a un objeto Date en formato ISO
    const nuevaFechaISO = new Date(`${fecha}T00:00:00.000Z`);
    const nuevaHoraInicio = new Date(horaInicio);
    const nuevaHoraFin = new Date(horaFin);

    // Normalizar la fecha de la entrada para la comparación
    function normalizeDate(dateString: string): Date {
      return new Date(dateString);
    }

    // Verificar solapamientos
    for (const horario of bloqueos) {
      // Convertir la fecha del horario existente a un objeto Date en formato ISO
      const horarioFechaISO = normalizeDate(horario.fecha);
      const horarioHoraInicio = normalizeDate(horario.hora_inicio);
      const horarioHoraFin = normalizeDate(horario.hora_fin);

      if (
        horario.dia_semana === dias &&
        horarioFechaISO.getTime() === nuevaFechaISO.getTime()
      ) {
        if (
          this.isOverlapping(
            nuevaHoraInicio,
            nuevaHoraFin,
            horarioHoraInicio,
            horarioHoraFin
          )
        ) {
          this.noti.mensaje(
            'Error de Bloqueo',
            'El nuevo bloqueo se sobrepone con un bloqueo existente.',
            TipoMessage.error
          );
          return false;
        }
      }
    }
    return true;
  }

  obtenerHorarioSucursal(id: any): Promise<void> {
    return new Promise((resolve, reject) => {
      this.gService
        .get('sucursalHorarios', id)
        .pipe(takeUntil(this.destroy$))
        .subscribe(
          (data: any) => {
            console.log(data);
            this.datos = data;
            resolve();
          },
          (error) => {
            console.error('Error fetching horarios:', error);
            reject(error);
          }
        );
    });
  }

  validateDateRange(): boolean {
    const fecha = this.bloqueoForm.get('fecha')?.value;
    const horaInicio = this.bloqueoForm.get('horaInicio')?.value;
    const horaFin = this.bloqueoForm.get('horaFin')?.value;

    if (!fecha || !horaInicio || !horaFin) {
      return true; // Si falta alguna fecha u hora, no se valida
    }

    // Formatear la fecha en formato YYYY-MM-DD
    const formattedDate = new Date(fecha).toISOString().split('T')[0];

    // Combinar fecha y hora
    const inicioDateTime = new Date(`${formattedDate}T${horaInicio}:00`);
    const finDateTime = new Date(`${formattedDate}T${horaFin}:00`);

    // Verificar que la hora de fin sea posterior a la hora de inicio
    if (finDateTime <= inicioDateTime) {
      this.noti.mensaje(
        'Error de Rango de Horas',
        'La hora final debe ser posterior a la hora de inicio',
        TipoMessage.error
      );
      return false;
    }

    return true;
  }

  futureDateValidator(control: AbstractControl): ValidationErrors | null {
    const today = new Date();
    const inputDate = new Date(control.value);

    // Normalizar las fechas a medianoche
    today.setHours(0, 0, 0, 0);
    inputDate.setHours(0, 0, 0, 0);

    if (inputDate < today) {
      return { pastDate: true };
    }

    return null;
  }

  //Crear Formulario
  formularioReactive() {
    let formatoHoras = /^([01]\d|2[0-3]):([0-5]\d)$/;

    this.bloqueoForm = this.fb.group({
      id: [null, null],
      sucursales: [null, Validators.required],
      dias: [null, Validators.required],
      fecha: [
        null,
        Validators.compose([Validators.required, this.futureDateValidator]),
      ],
      horaInicio: [
        null,
        Validators.compose([
          Validators.required,
          Validators.pattern(formatoHoras),
        ]),
      ],
      horaFin: [
        null,
        Validators.compose([
          Validators.required,
          Validators.pattern(formatoHoras),
        ]),
      ],
    });
  }

  ListaSucursales() {
    this.sucursalesList = null;
    this.gService
      .list('sucursal')
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: any) => {
        // console.log(data);
        this.sucursalesList = data;
      });
  }

  public errorHandling = (controlName: string) => {
    let messageError = '';
    const control = this.bloqueoForm.get(controlName);
    if (control.errors) {
      for (const message of FormErrorMessageHorarios) {
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

  // Método para convertir fecha a formato DATETIME(3)
  // Método para convertir fecha a formato YYYY-MM-DD
  formatDate(date: Date): string {
    return format(date, 'yyyy-MM-dd');
  }

  // Método para combinar la fecha con la hora
  combineDateAndTime(date: string, time: string): string {
    // Combina la fecha y la hora en un solo string en formato ISO
    return `${date}T${time}:00`; // Asume que la hora viene en HH:mm
  }

  async submitBloqueo(): Promise<void> {
    //Verificar validación
    if (this.bloqueoForm.invalid) {
      return;
    }

    if (!this.validateDateRange()) {
      return; // Si la validación falla, no continuar
    }

    console.log(this.bloqueoForm.value);

    //sucursal
    /* let sucursalForm = this.bloqueoForm
      .get('sucursales')
      .value.map((x: any) => ({ ['id']: x }));

    //dia
    let diaForm = this.bloqueoForm
      .get('dias')
      .value.map((x: any) => ({ ['id']: x })); */

    //Asignar los valores correctos al formulario patchValue setValue
    /*
    this.bloqueoForm.patchValue({
      sucursales: sucursalForm,
      dias: diaForm,
    }); */

    // Obtener los valores del formulario
    // Obtener los valores del formulario
    const formValue = this.bloqueoForm.value;

    // Formatear la fecha
    const formattedFecha = this.formatDate(formValue.fecha);

    // Combinar la fecha con la hora de inicio y fin
    const formattedHoraInicio = this.combineDateAndTime(
      formattedFecha,
      formValue.horaInicio
    );
    const formattedHoraFin = this.combineDateAndTime(
      formattedFecha,
      formValue.horaFin
    );

    // Asignar los valores formateados al objeto que se enviará
    const formattedData = {
      ...formValue,
      fecha: formattedFecha, // Solo la fecha
      horaInicio: formattedHoraInicio, // Fecha combinada con hora de inicio
      horaFin: formattedHoraFin, // Fecha combinada con hora de fin
    };
    await this.obtenerHorarioSucursal(formattedData.sucursales);

    if (!this.VerificarHorarios(formattedData)) {
      return;
    }

    if (!this.VerificarBloqueos(formattedData)) {
      return;
    }

    //Guardar videojuego
    this.guardarBloqueo(formattedData);
  }

  guardarBloqueo(data: any) {
    if (this.isCreate) {
      // Acción API create enviando toda la información del formulario
      this.gService
        .create('bloqueo', data)
        .pipe(takeUntil(this.destroy$))
        .subscribe((response: any) => {
          // Obtener respuesta
          this.respbloqueo = response;
          this.noti.mensajeRedirect(
            'Crear bloqueo',
            `Bloqueo creado!`,
            TipoMessage.success,
            'horario'
          );
          this.router.navigate(['/horario']);
        });
    } /* else {
      // Acción API actualizar enviando toda la información del formulario
      this.gService
        .update('bloqueo', data)
        .pipe(takeUntil(this.destroy$))
        .subscribe((response: any) => {
          // Obtener respuesta
          this.respbloqueo = response;
  
          this.noti.mensajeRedirect(
            'Actualizar bloqueo',
            `bloqueo actualizado: ${response.nombre}`,
            TipoMessage.success,
            'bloqueo'
          );
          this.router.navigate(['/bloqueo']);
        }); 
    }*/
  }

  onReset() {
    this.bloqueoForm.reset();
  }

  onBack() {
    this.router.navigate(['/horario']);
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
