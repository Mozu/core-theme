import { NgModule } from '@angular/core';

import { TableModule } from 'primeng/table';

import { SharedModule } from '@shared/shared.module';

import {
LocationGroupsListComponent,
LocationGroupCreateComponent

} from './location-groups';

@NgModule({
  declarations: [
    LocationGroupsListComponent,
    LocationGroupCreateComponent
    ],
  imports: [
    SharedModule,
    TableModule
  ]
})
export class LocationGroupsModule { }
