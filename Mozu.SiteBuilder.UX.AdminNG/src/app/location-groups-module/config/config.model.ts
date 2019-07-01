import { SiteModel } from '../create/location.group.model';
import { FormGroup } from '@angular/forms';

export class LocationGroupConfigModel {

    sitesLst: SiteModel[];
    selectedSite: SiteModel;
    locationGroupConfigForm: FormGroup;
    LCCustomerPickupActions : any[];
    LCCustomerPickupReminders : any[];
    LCCarriers : any[];
}