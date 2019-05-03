import { NgModule } from '@angular/core';

import { TableModule } from 'primeng/table';

import { SharedModule } from '@shared/shared.module';

import {
LocationGroupsListComponent

} from './location-groups';

@NgModule({
  declarations: [
    LocationGroupsListComponent
    
    ],
  imports: [
    SharedModule,
    TableModule
  ]
})
export class LocationGroupsModule { }
