import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { CoreModule } from './core/core.module';
import { ShareModule } from './share/share.module';
import { HomeModule } from './home/home.module';
import { UserModule } from './user/user.module';
import { ProductoModule } from './producto/producto.module';
//import { OrdenModule } from './orden/orden.module';
import { FacturaModule } from './factura/factura.module';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { ReservaModule } from './reserva/reserva.module';
import { ServicioModule } from './servicio/servicio.module';
import { ToastrModule } from 'ngx-toastr';
import { SucursalModule } from './sucursal/sucursal.module';
import { HorarioModule } from './horario/horario.module';
import { OrdenModule } from './orden/orden.module';
import { HttpErrorInterceptorService } from './share/http-error-interceptor.service';
import { HttpAuthInterceptorService } from './share/http-auth-interceptor.service';
import { AgendaModule } from './agenda/agenda.module';
import { ReportesModule } from './reportes/reportes.module';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    ToastrModule.forRoot(),
    CoreModule,
    ShareModule,
    HomeModule,
    UserModule,
    ProductoModule,  
    FacturaModule,
    ReservaModule,
    ServicioModule,    
    SucursalModule, 
    HorarioModule,    
    OrdenModule,
    AgendaModule,
    ReportesModule,
    //AppRoutingModule siempre va de ultimo 
    AppRoutingModule,
    
  ],
  providers: [
    provideAnimationsAsync(),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpErrorInterceptorService,
      multi:true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpAuthInterceptorService,
      multi:true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
