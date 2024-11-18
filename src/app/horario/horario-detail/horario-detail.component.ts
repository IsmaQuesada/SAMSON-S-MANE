import { Component } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { GenericService } from '../../share/generic.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-horario-detail',
  templateUrl: './horario-detail.component.html',
  styleUrl: './horario-detail.component.css'
})
export class HorarioDetailComponent {
  datos: any;
  destroy$: Subject<boolean> = new Subject<boolean>();
  constructor(private gService: GenericService,
    private route:ActivatedRoute,
    private router: Router
  ) {
    let id=this.route.snapshot.paramMap.get('id')
    if(!isNaN(Number(id))) 
      this.obtenerHorario(Number(id))
  }

  obtenerHorario(id: any) {
    this.gService
      .get('horario', id)
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: any) => {
        console.log(data);
        this.datos = data;
      });
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  regresar() {
    this.router.navigate(['/horario'])
  }
}
