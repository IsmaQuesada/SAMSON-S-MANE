import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Horario } from '../../server/controllers/reservaController'; // Asegúrate de importar el modelo correctamente

@Injectable({
  providedIn: 'root'
})
export class HorarioService {

  private apiUrl = 'http://localhost:3000/reserva/disponibles'; // Cambia la URL según tu configuración

  constructor(private http: HttpClient) { }

  getHorarios(sucursalId: number, fecha: string): Observable<Horario[]> {
    return this.http.get<Horario[]>(`${this.apiUrl}/${sucursalId}/${fecha}`);
  }
}
