import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AgendaIndexComponent } from './agenda-index/agenda-index.component';

const routes: Routes = [
  { path: 'agenda', component: AgendaIndexComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AgendaRoutingModule { }
