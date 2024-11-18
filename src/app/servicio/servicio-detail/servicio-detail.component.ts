import { Component } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { GenericService } from '../../share/generic.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService } from '../../share/authentication.service';

@Component({
  selector: 'app-servicio-detail',
  templateUrl: './servicio-detail.component.html',
  styleUrl: './servicio-detail.component.css'
})
export class ServicioDetailComponent {
  datos: any;
  destroy$: Subject<boolean> = new Subject<boolean>();
  currentUser: any;

  constructor(private gService: GenericService,
    private route:ActivatedRoute,
    private router: Router,
    private authService: AuthenticationService
  ) {
    let id=this.route.snapshot.paramMap.get('id')
    if(!isNaN(Number(id))) 
      this.obtenerProducto(Number(id))
  }

  ngOnInit(): void {
    //Información usuario actual
    this.authService.decodeToken.subscribe((user: any) => {
      this.currentUser = user;
    });
  }

  obtenerProducto(id: any) {
    this.gService
      .get('servicio', id)
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
    this.router.navigate(['/servicio'])
  }
}
