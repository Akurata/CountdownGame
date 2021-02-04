import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';

import { PagesComponent } from './pages.component';
import { LettersComponent } from './letters/letters.component';
import { NumbersComponent } from './numbers/numbers.component';
import { NotFoundComponent } from './miscellaneous/not-found/not-found.component';

const routes: Routes = [{
  path: '',
  component: PagesComponent,
  children: [
    {
      path: 'numbers',
      component: NumbersComponent,
    },
    {
      path: 'letters',
      component: LettersComponent,
    },
    {
      path: '',
      redirectTo: 'numbers',
      pathMatch: 'full',
    },
    {
      path: '**',
      component: NotFoundComponent,
    },
  ],
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PagesRoutingModule {
}
