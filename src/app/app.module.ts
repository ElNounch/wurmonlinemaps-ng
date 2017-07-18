import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MdToolbarModule, MdSidenavModule, MdButtonModule, MdCheckboxModule, MdIconModule, MdSlideToggleModule, MaterialModule } from '@angular/material';

import { AppComponent } from './app.component';

import { DeedsService } from './deeds.service'

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    HttpModule,
    BrowserAnimationsModule,
    MdToolbarModule, MdSidenavModule, MdButtonModule, MdCheckboxModule, MdIconModule, MdSlideToggleModule, MaterialModule
  ],
  providers: [
    DeedsService
  ],
  bootstrap: [
    AppComponent
  ]
})
export class AppModule { }
