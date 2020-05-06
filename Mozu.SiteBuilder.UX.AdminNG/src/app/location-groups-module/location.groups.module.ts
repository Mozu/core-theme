import { NgModule } from '@angular/core';
import { SharedModule } from '@shared/shared.module';
import {
  LocationGroupsListComponent,
  LocationGroupCreateComponent
} from './index';
import { LocationGroupConfigComponent } from './config/config.component';

@NgModule({
  declarations: [
    LocationGroupsListComponent,
    LocationGroupCreateComponent,
    LocationGroupConfigComponent
  ],
  imports: [
    SharedModule
  ]
})
export class LocationGroupsModule { }
