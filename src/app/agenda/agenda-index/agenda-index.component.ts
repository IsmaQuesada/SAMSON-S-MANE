import { Component } from '@angular/core';
import { GenericService } from '../../share/generic.service';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../share/authentication.service';
import { NotificacionService, TipoMessage } from '../../share/notification.service';
import { Subject, takeUntil } from 'rxjs';
import moment from 'moment';

interface CalendarDay {
  date: moment.Moment;
  isBlocked: boolean;
}

@Component({
  selector: 'app-agenda-index',
  templateUrl: './agenda-index.component.html',
  styleUrls: ['./agenda-index.component.css']  // Cambié styleUrl por styleUrls
})
export class AgendaIndexComponent {
  sucursalId: number = 0; // Define el ID de la sucursal que quieres filtrar
  destroy$: Subject<boolean> = new Subject<boolean>();
  datos: any[] = [];
  bloqueos: any[] = [];

  startOfWeek: moment.Moment;
  endOfWeek: moment.Moment;
  weekDays: moment.Moment[];
  selectedReserva: any;
  reservas: any[] = [];
  reservasPorDia: { [key: string]: any[] } = {};
  currentWeekStart: moment.Moment;
  currentMonth: moment.Moment;
  calendarDays: CalendarDay[] = [];
  showModal: boolean = false;
  sucursales: any[] = [];

  usuario: any

  constructor(
    private gService: GenericService,
    private router: Router,
    private authService: AuthenticationService,
    private noti: NotificacionService
  ) { }

  ngOnInit(): void {
    this.getCurrentUser();
    this.currentWeekStart = moment().startOf('week');
    this.currentMonth = moment();
    this.generarSemanaActual();
    this.listReservas();
    this.generateCalendar();
    //this.obtenerBloqueo(); // Llama al método para obtener bloqueos
  }

  private obtenerEncargado(id: any) {
    this.gService
      .get('usuario/', id)
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: any) => {
        this.sucursalId = data.sucursalId;
        this.usuario = data;

        if (this.usuario.role === 'ADMIN') {
          // Si el usuario es admin, no cargamos los bloqueos aún
          // Solo mostramos el selector de sucursal
          this.obtenerBloqueo(); // Opcional, dependiendo de si quieres cargar los bloqueos de una sucursal por defecto
          this.listSucursal();
        } else {
          this.obtenerBloqueo(); // Cargar bloqueos para la sucursal del encargado
        }
      });
  }

  private getCurrentUser(): void {
    this.authService.decodeToken.pipe(takeUntil(this.destroy$)).subscribe({
      next: (user: any) => {
        this.obtenerEncargado(user.id);
        this.listReservas();
        //this.obtenerBloqueo(); // Llama a obtenerBloqueo después de que se haya establecido sucursalId

      },
      error: (err) => this.handleError(err, 'Error al obtener el usuario'),
    });
  }


  generarSemanaActual() {
    this.weekDays = [];
    for (let i = 0; i < 7; i++) {
      this.weekDays.push(moment(this.currentWeekStart).add(i, 'days'));
    }
  }

  previousWeek() {
    this.currentWeekStart = this.currentWeekStart.clone().subtract(1, 'week');
    this.generarSemanaActual();
  }

  nextWeek() {
    this.currentWeekStart = this.currentWeekStart.clone().add(1, 'week');
    this.generarSemanaActual();
  }




  generateCalendar() {
    const startOfMonth = this.currentMonth.clone().startOf('month').startOf('week');
    const endOfMonth = this.currentMonth.clone().endOf('month').endOf('week');

    const day = startOfMonth.clone();
    this.calendarDays = [];

    while (day.isBefore(endOfMonth)) {
      const isBlocked = this.bloqueos.some((bloqueo) =>
        day.isSame(moment(bloqueo.fecha), 'day')
      );

      this.calendarDays.push({
        date: day.clone(),
        isBlocked: isBlocked
      });

      day.add(1, 'day');
    }

    console.log("Días del calendario generados");
  }



  listReservas() {
    this.gService
      .list('reserva/')
      .pipe(takeUntil(this.destroy$))
      .subscribe((respuesta: any) => {
        const filteredReservas = respuesta.filter(
          (reserva: any) => reserva.sucursalId === this.sucursalId
        );
        this.reservas = filteredReservas;

        this.reservasPorDia = {}; // Limpia la estructura antes de llenarla
        this.reservas.forEach(reserva => {
          const fechaKey = moment(reserva.fecha).format('YYYY-MM-DD');
          if (!this.reservasPorDia[fechaKey]) {
            this.reservasPorDia[fechaKey] = [];
          }
          this.reservasPorDia[fechaKey].push(reserva);
        });

        console.log("Reservas actualizadas");
      });
  }
  //lista de sucursales
  listSucursal() {
    this.gService
      .list('sucursal/')
      .pipe(takeUntil(this.destroy$))
      .subscribe((respuesta: any) => {
        console.log(respuesta);
        this.sucursales = respuesta;

      });
  }

  //bloqueo por sucursal
  private obtenerBloqueo(): void {

    this.gService
      .list(`bloqueo/`) // Usa el ID de sucursal almacenado en la propiedad
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: any) => {
        const filtereBloqueos = data.filter(
          (bloqueo: any) => bloqueo.sucursal_id === this.sucursalId
        );
        console.log(filtereBloqueos);
        this.bloqueos = filtereBloqueos;

        // Llama a la función para actualizar el calendario
        this.updateCalendar();
      });
  }

  getDayClasses(day: moment.Moment): { [key: string]: boolean } {
    return {
      'today': this.isToday(day),
      'has-reserva': this.hasReserva(day),
      'blocked-day': this.bloqueos.some(bloqueo => moment(bloqueo.fecha).isSame(day, 'day'))
    };
  }

  updateCalendar() {
    // Regenera el calendario para aplicar los cambios
    this.generateCalendar();

    // Actualiza las reservas después de generar el calendario
    this.listReservas();

    console.log("Calendario actualizado");
  }

  isToday(day: moment.Moment): boolean {
    return day.isSame(moment(), 'day');
  }

  hasReserva(day: moment.Moment): boolean {
    return this.reservas.some(reserva => moment(reserva.fecha).isSame(day, 'day'));
  }

  isCurrentMonth(day: moment.Moment): boolean {
    return day.isSame(this.currentMonth, 'month');
  }

  prevMonth() {
    this.currentMonth.subtract(1, 'month');
    this.generateCalendar();
  }

  nextMonth() {
    this.currentMonth.add(1, 'month');
    this.generateCalendar();
  }

  getReservasDelDia(day: moment.Moment) {
    const fechaKey = day.format('YYYY-MM-DD');
    return this.reservasPorDia[fechaKey] || [];
  }

  openModal(day: moment.Moment): void {
    const reservas = this.getReservasDelDia(day);
    if (reservas.length > 0) {
      this.selectedReserva = reservas[0];  // Tomar la primera reserva del día para mostrar
      this.showModal = true;
    }
  }

  closeModal() {
    this.showModal = false;
    this.selectedReserva = null;
  }

  onSucursalChange(event: any) {
    this.sucursalId = +event.target.value; // Convertir a número
    console.log("Sucursal cambiada a:" + this.sucursalId);

    // Obtener bloqueos y reservas después de cambiar la sucursal
    this.obtenerBloqueo();
    this.listReservas(); // Asegúrate de que las reservas se actualicen
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  private handleError(error: any, message: string): void {
    console.error
  }
}