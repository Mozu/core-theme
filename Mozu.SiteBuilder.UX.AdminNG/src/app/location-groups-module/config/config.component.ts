import { Component, OnInit } from '@angular/core';
import { SelectItem } from 'primeng/api';
import { LoggerService } from '@core';
import { SharedDataService } from '@global';
import { LocationGroupConfigModel } from './config.model';
import { FormBuilder, Validators, FormArray, FormControl, FormGroup } from '@angular/forms';
import { Constants } from '@shared';

@Component({
    selector: 'app-locationgroup-config',
    templateUrl: './config.component.html',
    styleUrls: ['./config.component.css']
})
export class LocationGroupConfigComponent implements OnInit {
    public model: LocationGroupConfigModel;

    constructor(
        private _loggerService: LoggerService,
        private _sharedData: SharedDataService,
        private fb: FormBuilder
    ) { }

    ngOnInit() {
        this.model = new LocationGroupConfigModel();
        this.model.LCCustomerPickupActions = Constants.LCCustomerPickupActions;
        this.model.LCCustomerPickupReminders = Constants.LCCustomerPickupReminders;
        this.model.LCCarriers = Constants.LCCarriers;
        this.model.LCDefaultCarrier = Constants.LCDefaultCarrier;
        this.model.LCPrintReturnLabel = Constants.LCPrintReturnLabel;
        this.model.LCDefaultPrinterType = Constants.LCDefaultPrinterType;
        this.model.LCUPSUSShippingTypes = Constants.LCUPSUSShippingTypes;

        this.model.locationGroupConfigForm = this.fb.group({
            customerFailedToPickupAfterAction: ['', []],
            customerFailedToPickupDeadline: ['', []],
            sendCustomerPickupReminder: ['', []],
            carriers: new FormArray([]),
            defaultCarrier: ['', []],
            printReturnLabel: ['', []],
            defaultPrinterType: ['', []],
            boxItems: this.fb.array([ this.createBoxItem()]),
            upsUsShippingTypes: new FormArray([]),
            upsUSStandardDefault:  ['', []],
            upsUSExpress1DayDefault:  ['', []],
            upsUSExpress2DayDefault:  ['', []],
            upsUSExpress3DayDefault:  ['', []]
        });

        this.addCarriersCheckboxes();
        this.addUPSUSShippingTypesCheckboxes();
        this.fetchSitesData();
        this.updateLocationGroupConfigForm();

    }

    private addCarriersCheckboxes(){
        this.model.LCCarriers.map((o, i) => {
            const control = new FormControl(); // if first item set to true, else false
            (this.model.locationGroupConfigForm.controls.carriers as FormArray).push(control);
        });
    }

    private addUPSUSShippingTypesCheckboxes(){
        this.model.LCUPSUSShippingTypes.map((o, i) => {
            const control = new FormControl(); // if first item set to true, else false
            (this.model.locationGroupConfigForm.controls.upsUsShippingTypes as FormArray).push(control);
        });
    }

    addBoxItem(): void {
        (this.model.locationGroupConfigForm.controls.boxItems as FormArray).push(this.createBoxItem());
    }

    removeBoxItem(rowIndex){
        (this.model.locationGroupConfigForm.controls.boxItems as FormArray).removeAt(rowIndex);
    }

    private createBoxItem(): FormGroup {
        return this.fb.group({
          name: '',
          length: '',
          width: '',
          height: ''
        });
    }

    public fetchSitesData = () => {
        this._loggerService.info('LocationGroupCreateComponent : fetchSitesData');
        if (this._sharedData._sharedData.items.ctTenant.sites) {
            this.model.sitesLst = this._sharedData._sharedData.items.ctTenant.sites;
            if (this.model.sitesLst.length > 0) {
                this.model.selectedSite = this.model.sitesLst[0];
            }
        }
    }

    private updateLocationGroupConfigForm(): void {
        this.model.locationGroupConfigForm.patchValue({
            customerFailedToPickupAfterAction: 'CUSTOMER_CARE',
            sendCustomerPickupReminder: '2',
            defaultCarrier: 'None',
            printReturnLabel: 'Yes',
            defaultPrinterType: 'Laser',
            preferredPickupTime: '00:00',
            closingTime:  '00:00'
        });
    }


}
