import { NgModule } from '@angular/core';

import { TableModule } from 'primeng/table';
import {TreeTableModule} from 'primeng/treetable';


import { SharedModule } from '@shared/shared.module';

import {
LocationGroupsListComponent,
LocationGroupCreateComponent,
LocationsListComponent,
PhysicallocationComponent

} from './location-groups';

@NgModule({
  declarations: [
    LocationGroupsListComponent,
    LocationGroupCreateComponent,
    LocationsListComponent,
    PhysicallocationComponent
    ],
  imports: [
    SharedModule,
    TableModule,
    TreeTableModule
  ]
})
export class LocationGroupsModule { }
