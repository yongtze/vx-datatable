import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { VxDataTableComponent, VxColumnComponent } from './vx-datatable/vx-datatable.component';
import { VxVScrollBarComponent } from './vx-scrollbar/vx-vscrollbar.component';
import { VxHScrollBarComponent } from './vx-scrollbar/vx-hscrollbar.component';

@NgModule({
  declarations: [
    AppComponent,
    VxDataTableComponent,
    VxColumnComponent,
    VxVScrollBarComponent,
    VxHScrollBarComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
