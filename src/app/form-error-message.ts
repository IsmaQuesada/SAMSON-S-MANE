export class ErrorMessage {
    constructor(
      public forControl: string,
      public forValidator: string,
      public text: string
    ) { }
  }
//Mensajes de errores de validación
export const FormErrorMessage = [
  new ErrorMessage('nombre', 'required', 'El Nombre es requerido'),
  new ErrorMessage('nombre', 'minlength', 'El nombre debe tener 3 carácteres mínimo'),
  new ErrorMessage('descripcion', 'required', 'La descripción es requerida'),
  new ErrorMessage('tarifa', 'required', 'La tarifa es requerida'),
  new ErrorMessage('role', 'required', 'Debe seleccionar un rol'),
  new ErrorMessage('tarifa', 'pattern', 'La tarifa solo acepta números con dos decimales'),
  new ErrorMessage('tiempoServicio', 'required', 'El tiempo del servicio es requerido'),
  new ErrorMessage('tiempoServicio', 'pattern', 'El tiempo del servicio solo acepta minutus'),
  new ErrorMessage('requisitosPrevios', 'required', 'Son necesarios los requisitos previos al servicio'),
  new ErrorMessage('Precauciones', 'required', 'Son necesarios las precauciones del servicio'),
  new ErrorMessage('email', 'required', 'El email es requerido'),
  new ErrorMessage('password', 'required', 'La contraseña es requerido'),
  new ErrorMessage('tel', 'required', 'El teléfono'),
  new ErrorMessage('rol', 'required', 'El rol es requerido'),
  new ErrorMessage('Precauciones', 'required', 'Son necesarios las precauciones del servicio'),
  new ErrorMessage('fecha', 'required', 'La Fecha es requerida'),
  new ErrorMessage('selectedClient', 'required', 'Se tiene que seleccionar un Cliente'),
  new ErrorMessage('selectedService', 'required', 'Se tiene que seleccionar un servicio'),
  new ErrorMessage('selectedHorario', 'required', 'Se tiene que seleccionar un horario'),
  new ErrorMessage('selectedHoraLlegada', 'required', 'Se tiene que seleccionar la hora de llegada'),
  new ErrorMessage('TipoCorte', 'required', 'Campo requerido'),
  new ErrorMessage('alergias', 'required', 'Campo requerido'),
  new ErrorMessage('preferenciaProductos', 'required', 'Campo requerido'),
];

export const FormErrorMessageProducto = [
  new ErrorMessage('nombre', 'required', 'El Nombre es requerido'),
  new ErrorMessage('nombre', 'minlength', 'El nombre debe tener 3 carácteres mínimo'),
  new ErrorMessage('descripcion', 'required', 'La descripción es requerida'),
  new ErrorMessage('precio', 'required', 'El precio es requerida'),
  new ErrorMessage('precio', 'pattern', 'El precio solo acepta números con dos decimales'),
  new ErrorMessage('marca', 'required', 'La marca del producto es requerido'),
  new ErrorMessage('uso', 'required', 'El uso del producto es requerido'),
  new ErrorMessage('categoria', 'required', 'Tiene que seleccionar una categoria para el producto'),

];

export const FormErrorMessageSucursal = [
  new ErrorMessage('nombre', 'required', 'El Nombre es requerido'),
  new ErrorMessage('nombre', 'minlength', 'El nombre debe tener 3 carácteres mínimo'),
  new ErrorMessage('descripcion', 'required', 'La descripción es requerida'),
  new ErrorMessage('telefono', 'required', 'El telefono es requerida'),
  new ErrorMessage('telefono', 'pattern', 'El telefono solo acepta números no letras'),
  new ErrorMessage('direccion', 'required', 'La marca del producto es requerido'),
  new ErrorMessage('email', 'required', 'El uso del producto es requerido'),
  //new ErrorMessage('categoria', 'required', 'Tiene que seleccionar una categoria para el producto'),

];


export const FormErrorMessageHorarios = [
  new ErrorMessage('sucursales', 'required', 'Es requerido que seleccione una sucursal'),
  new ErrorMessage('dias', 'required', 'Es requerido que seleccione un dia de la semana'),
  new ErrorMessage('fecha', 'required', 'Es requerido que seleccione la fecha'),
  new ErrorMessage('horaInicio', 'required', 'Es requerido que ingrese la hora inicial'),
  new ErrorMessage('horaInicio', 'pattern', 'Debe ingresar el formato correspondiente'),
  new ErrorMessage('fecha', 'pastDate', 'Debe ingresar una fecha no sea anterior a la fecha actual'),
  new ErrorMessage('horaFin', 'required', 'Es requerido que ingrese la hora final'),
  new ErrorMessage('horaFin', 'pattern', 'Debe ingresar el formato correspondiente'),
];

export const FormErrorMessageFacturar = [
  new ErrorMessage('clientes', 'required', 'Es requerido que seleccione un cliente'),
];
