import { Component } from '@angular/core';
import { GenericService } from '../../share/generic.service';
import { Subject, takeUntil } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-bloqueo-detail',
  templateUrl: './bloqueo-detail.component.html',
  styleUrl: './bloqueo-detail.component.css'
})
export class BloqueoDetailComponent {
  datos: any;
  destroy$: Subject<boolean> = new Subject<boolean>();
  constructor(private gService: GenericService,
    private route:ActivatedRoute,
    private router: Router
  ) {
    let id=this.route.snapshot.paramMap.get('id')
    if(!isNaN(Number(id))) 
      this.obtenerBloqueo(Number(id))
  }

  obtenerBloqueo(id: any) {
    this.gService
      .get('bloqueo', id)
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
