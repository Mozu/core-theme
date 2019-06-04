import { NgModule } from '@angular/core';
import { SharedModule } from '@shared/shared.module';
import {
  LocationGroupsListComponent,
  LocationGroupCreateComponent
} from './index';

@NgModule({
  declarations: [
    LocationGroupsListComponent,
    LocationGroupCreateComponent
  ],
  imports: [
    SharedModule
  ]
})
export class LocationGroupsModule { }
