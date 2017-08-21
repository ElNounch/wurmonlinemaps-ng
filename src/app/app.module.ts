import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
 import { RouterModule, Routes } from '@angular/router';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MdToolbarModule, MdSidenavModule, MdButtonModule, MdCheckboxModule, MdIconModule, MdSlideToggleModule, MaterialModule, MdAutocompleteModule } from '@angular/material';

import { LocalStorageModule } from 'angular-2-local-storage';

import { AppComponent } from './app.component';

import { DeedsService } from './deeds.service'

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    HttpModule,
    FormsModule, ReactiveFormsModule,
    BrowserAnimationsModule,
    MdToolbarModule, MdSidenavModule, MdButtonModule, MdCheckboxModule, MdIconModule, MdSlideToggleModule, MaterialModule, MdAutocompleteModule,
    LocalStorageModule.withConfig({
      prefix: 'wurm-maps',
      storageType: 'localStorage'
    }),
    RouterModule.forRoot([{
      path: "",
      component: AppComponent
    }])
  ],
  providers: [
    DeedsService
  ],
  bootstrap: [
    AppComponent
  ]
})
export class AppModule { }
