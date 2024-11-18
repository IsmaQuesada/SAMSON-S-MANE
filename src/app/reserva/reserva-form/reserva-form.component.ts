import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { GenericService } from '../../share/generic.service';
import { NotificacionService, TipoMessage } from '../../share/notification.service';
import { FileUploadService } from '../../share/file-upload.service';
import { Subject, takeUntil } from 'rxjs';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { HorarioService } from '../../../HorarioServicio';
import moment from 'moment';
import { FormErrorMessage } from '../../form-error-message';
import { AuthenticationService } from '../../share/authentication.service';

@Component({
  selector: 'app-reserva-form',
  templateUrl: './reserva-form.component.html',
  styleUrl: './reserva-form.component.css'
})
export class ReservaFormComponent {
  clients: any[] = [];  // Array para almacenar los clientes
  selectedClient: any = null;  // Cliente seleccionado
  sucursalInfo: any = null;  // Información de la sucursal

  services: any[] = [];  // Array para almacenar los clientes
  selectedService: any = null;  // Cliente seleccionado

  sucursalId: number = 0; // Define el ID de la sucursal que quieres filtrar


  //prueba
  fecha: string = null; // Cambia según tu necesidad
  horarios: any[] = [];
  selectedHorario: any = null;  // horario seleccionado
  availableArrivalTimes: string[] = []; // Aquí se almacenarán las horas de llegada disponibles
  selectedHoraLlegada: any = null;  // horario llegada del usuario
  availableDates: Set<string> = new Set<string>();

  //estado
  estado: string = 'PENDIENTE'; // Inicializar con "PENDIENTE"

  destroy$: Subject<boolean> = new Subject<boolean>();
  //Titulo
  titleForm: string = 'Crear';
  //Lista de encargados
  ClientesList: any;
  //Reserva a actualizar
  ReservaInfo: any;
  //Respuesta del API crear/modificar
  respReserva: any;
  //Nombre del formulario
  reservaForm: FormGroup;
  //formulario para proforma
  proformaForm: FormGroup;
  //id del Videojuego
  idSucursal: number = 0;
  //Sí es crear
  isCreate: boolean = true;
  //para identificar al usuario encargado y la sucursal
  isAuntenticated: boolean
  currentUser: any

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private activeRouter: ActivatedRoute,
    private gService: GenericService,
    private noti: NotificacionService,
    private uploadService: FileUploadService,
    private horarioService: HorarioService,
    private authService: AuthenticationService,

  ) {
    this.formularioReactive();
    //this.listaGeneros();
    //this.listaEncargados();
    this.listaClientes()
    this.listaServices()


  }


  trackById(index: number, item: any): number {
    return item.id;
  }

  ngAfterViewInit(): void {
    //this.sucursal(); //reemplazar por Listado de reservas
  }

  //usuario encargado
  ngOnInit(): void {
    this.getCurrentUser();


    // Configura el filtro para el mat-datepicker
    this.dateFilter = (date: Date | null): boolean => {
      if (!date) return false; // Si la fecha es null, no mostrar
      const dateString = moment(date).format('YYYY-MM-DD');
      // Permite seleccionar solo las fechas disponibles y futuras
      return this.availableDates.has(dateString) || moment(date).isSameOrAfter(moment().startOf('day'));
    };
  }

  private obtenerEncargado(id: any) {
    this.gService
      .get('usuario/', id)
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: any) => {
        this.sucursalId = data.sucursalId;
        console.log("id:" + this.sucursalId)
        //this.usuario = data;

        /* if (this.usuario.role === 'ADMIN') {
          // Si el usuario es admin, no cargamos los bloqueos aún
          // Solo mostramos el selector de sucursal
          this.obtenerBloqueo(); // Opcional, dependiendo de si quieres cargar los bloqueos de una sucursal por defecto
          this.listSucursal();
        } else {
          this.obtenerBloqueo(); // Cargar bloqueos para la sucursal del encargado
        } */
          this.sucursal();

      });
  }

  private getCurrentUser(): void {
    this.authService.decodeToken.pipe(takeUntil(this.destroy$)).subscribe({
      next: (user: any) => {
        this.obtenerEncargado(user.id);
        //this.listReservas();
        //this.obtenerBloqueo(); // Llama a obtenerBloqueo después de que se haya establecido sucursalId

      },
      error: (err) => this.handleError(err, 'Error al obtener el usuario'),
    });
  }
  //Crear Formulario
  formularioReactive() {
    let soloNumeros = /^[0-9]+$/;
    //[null, Validators.required]
    this.reservaForm = this.fb.group({
      id: [null, null],
      fecha: [null,
        Validators.compose([
          Validators.required,
        ])],
      TipoCorte: [null, Validators.required],
      estado: [this.estado], // Inicializa el estado con "PENDIENTE"
      alergias: [null, Validators.required],
      preferenciaProductos: [null, Validators.required],
      selectedClient: [null, Validators.required],
      selectedService: [null, Validators.required],
      selectedHorario: [null, Validators.required],
      selectedHoraLlegada: [null, Validators.required],
    });
  }

  addCliente() {
    // Verificar si ya hay una categoría en el array
    if (this.clienteArray.length >= 1) {
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
        ]),
      ],
      id: [
        null,
        Validators.compose([
          Validators.required,
        ]),
      ],
    });

    //verificar que solo se tenga una categoria 
    // Agregar un nuevo grupo a FormArray
    this.clienteArray.push(item);
  }
  removeCliente(i: number) {
    this.clienteArray.removeAt(i);
  }
  // Obtener el FormArray de las plataformas
  get clienteArray(): FormArray {
    return this.reservaForm.get('clienteArray') as FormArray;
  }
  //metodo que trae todos los clientes
  listaClientes() {
    this.ClientesList = null;
    this.gService
      .list('usuario/getClientes')
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: any) => {
        console.log(data);
        this.clients = data;
      });
  }

  //metodo que trae la sucursal especifica del encargado
  sucursal() {
    this.ClientesList = null;
    console.log(this.sucursalId)
    this.gService
      .get('sucursal', this.sucursalId)
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: any) => {
        console.log(data);
        this.sucursalInfo = data;
      });
  }

  //metodo que trae todos los servicios
  listaServices() {
    this.gService
      .list('servicio/')
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: any) => {
        console.log(data);
        this.services = data;
      });
  }

  loadHorarios() {
    console.log("Fecha:");
    console.log(this.fecha);

    this.horarioService.getHorarios(this.sucursalId, this.fecha)
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: any[]) => {
        console.log('Datos originales:', data);

        // Solo inicializa el conjunto si está vacío
        if (this.availableDates.size === 0) {
          this.availableDates = new Set<string>();
        }

        this.horarios = data.map(horario => {
          // Formatear la fecha y hora en formato UTC sin conversión a la zona horaria local
          const fechaUTC = moment.utc(horario.fecha).format('YYYY-MM-DD');
          const horaInicioUTC = moment.utc(horario.hora_inicio).format('HH:mm');
          const horaFinUTC = moment.utc(horario.hora_fin).format('HH:mm');

          // Agrega la fecha al conjunto de fechas disponibles
          this.availableDates.add(fechaUTC);

          // Imprimir para verificar la conversión UTC
          console.log('Fecha UTC:', fechaUTC);
          console.log('Hora Inicio UTC:', horaInicioUTC);
          console.log('Hora Fin UTC:', horaFinUTC);

          return {
            ...horario,
            fecha: fechaUTC,
            hora_inicio: horaInicioUTC,
            hora_fin: horaFinUTC,
          };
        });

        console.log('Datos convertidos:', this.horarios);

        // Verifica las fechas disponibles
        console.log('Fechas disponibles después de actualizar:', Array.from(this.availableDates));

        // Si ya se ha seleccionado un servicio, actualizar los tiempos de llegada disponibles
        if (this.selectedService) {
          this.updateAvailableArrivalTimes();
        }
      });
  }




  updateDateFilter() {
    this.availableDates = new Set(
      this.horarios.map(horario => moment(horario.fecha).format('YYYY-MM-DD'))
    );

    // Verifica las fechas disponibles
    console.log('Fechas disponibles:', Array.from(this.availableDates));
  }


  dateFilter = (date: Date | null): boolean => {
    if (!date) {
      return false;
    }
    const formattedDate = moment(date).format('YYYY-MM-DD');
    return this.availableDates.has(formattedDate);
  }






  updateAvailableArrivalTimes(): void {
    if (!this.selectedService || !this.horarios.length) {
      this.availableArrivalTimes = [];
      return;
    }

    const serviceDuration = Number(this.selectedService.tiempoServicio); // Duración del servicio en minutos
    console.log('Hora de llegada:', serviceDuration);

    const availableTimes: string[] = [];

    for (const horario of this.horarios) {
      const startTime = moment(horario.hora_inicio, 'HH:mm');
      const endTime = moment(horario.hora_fin, 'HH:mm');

      let currentTime = startTime.clone();
      // Calcular la última hora posible de llegada
      const lastPossibleArrival = endTime.clone().subtract(serviceDuration, 'minutes');

      // Generar horas de llegada válidas
      while (currentTime.isSameOrBefore(lastPossibleArrival)) {
        availableTimes.push(currentTime.format('HH:mm'));
        currentTime = currentTime.add(10, 'minutes'); // Intervalo de 10 minutos para cada opción
      }
    }

    this.availableArrivalTimes = availableTimes;
  }


  onArrivalTimeSelect(time: string): void {
    // Lógica para manejar la selección del tiempo de llegada
    this.selectedHoraLlegada = time;
    console.log('Hora de llegada seleccionada:', time);
  }

  onHorarioSelect(horario: any): void {
    this.selectedHorario = horario;
  }

  // Método para manejar la selección del cliente
  onClientSelect(client: any): void {
    this.selectedClient = client;
  }

  // Método para manejar la selección del servicio
  onServiceSelect(service: any): void {
    this.selectedService = service;

    // Actualizar los tiempos de llegada disponibles después de seleccionar el servicio
    this.updateAvailableArrivalTimes();
  }

  onDateChange(event: MatDatepickerInputEvent<Date>): void {
    if (event.value) {
      // Convierte el valor a una cadena en el formato adecuado
      this.fecha = this.formatDate(event.value);
      console.log('Fecha seleccionada:', this.fecha); // Verifica la fecha en la consola

      // Llama a loadHorarios después de actualizar la fecha
      this.loadHorarios();
    }
  }

  // Método para formatear la fecha a una cadena en el formato deseado
  formatDate(date: Date): string {
    // Puedes ajustar el formato de la fecha según tus necesidades
    // En este caso, utilizamos el formato ISO (YYYY-MM-DD)
    return date.toISOString().split('T')[0]; // '2024-07-23'
  }

  //manejador de errors
  public errorHandling = (controlName: string) => {
    let messageError = '';
    const control = this.reservaForm.get(controlName);
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


  submitReserva(): void {
    //Verificar validación
    //revisar esto
    if (this.reservaForm.invalid) {
      console.log("No sirve")
      console.log(this.reservaForm.value)

      return;
    }
    console.log(this.reservaForm.value);

    const productoData = {
      ...this.reservaForm.value,
      //  precio: this.acoplarPrecio(this.productoForm.value.precio_producto),
    };

    const reservaData = this.reservaForm.value;
    console.log("Proforma")
    console.log(reservaData)
    //Guardar reserva
    this.guardarReserva(reservaData);
  }
  guardarReserva(data: any) {
    if (this.isCreate) {
      this.gService
        .create('reserva', data)
        .pipe(takeUntil(this.destroy$))
        .subscribe((response: any) => {
          // Crear un nuevo FormGroup para proforma

          this.guardarProforma(data);
        });
    }
  }


  guardarProforma(data: any) {
    if (this.isCreate) {
      this.gService
        .create('proforma', data)
        .pipe(takeUntil(this.destroy$))
        .subscribe((response: any) => {
          console.log("Factura creada con id: " + response.id);
          if (response.id) { // Asegúrate de que el id no sea undefined
            this.detalle(response.id);
          } else {
            console.error('El id de la factura no está definido.');
          }
        }, error => {
          console.error('Error al crear la factura:', error);
        });
    }
  }
  detalle(id: number) {
    this.router.navigate(['/factura', id]);
  }

  onReset() {
    this.reservaForm.reset();
  }
  onBack() {
    this.router.navigate(['/reserva']);
  }
  ngOnDestroy() {
    this.destroy$.next(true);
    // Desinscribirse
    this.destroy$.unsubscribe();
  }

  private handleError(error: any, message: string): void {
    console.error
  }

}
