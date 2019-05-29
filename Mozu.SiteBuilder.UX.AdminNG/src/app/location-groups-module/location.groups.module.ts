import { NgModule } from '@angular/core';

// import { TableModule } from 'primeng/table';
// import {TreeTableModule} from 'primeng/treetable';


import { SharedModule } from '@shared/shared.module';

import {
LocationGroupsListComponent,
LocationGroupCreateComponent,
LocationGroupEditComponent
// LocationsListComponent//,
//PhysicallocationComponent

} from './index';

@NgModule({
  declarations: [
    LocationGroupsListComponent,
    LocationGroupCreateComponent,
    LocationGroupEditComponent
    // LocationsListComponent//,
    //PhysicallocationComponent
    ],
  imports: [
    SharedModule,
    // TableModule,
    // TreeTableModule
  ]
})
export class LocationGroupsModule { }
