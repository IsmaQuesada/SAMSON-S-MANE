import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AgendaRoutingModule } from './agenda-routing.module';
import { AgendaIndexComponent } from './agenda-index/agenda-index.component';
import { MatTooltipModule } from '@angular/material/tooltip';


@NgModule({
  declarations: [
    AgendaIndexComponent
  ],
  imports: [
    CommonModule,
    AgendaRoutingModule,
    MatTooltipModule
  ]
})
export class AgendaModule { }
