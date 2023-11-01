import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { DxDataGridModule } from 'devextreme-angular/ui/data-grid';
import { DxLoadIndicatorModule } from 'devextreme-angular/ui/load-indicator';
import { DxCheckBoxModule } from 'devextreme-angular/ui/check-box';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { GroupTextPipe } from './GroupRowSelection/group-text-pipe';
import { GroupRowComponent } from './GroupRowSelection/group-row-component/group-row.component';

@NgModule({
  declarations: [
    AppComponent,
    GroupTextPipe,
    GroupRowComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    DxDataGridModule,
    DxLoadIndicatorModule,
    DxCheckBoxModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule { }
