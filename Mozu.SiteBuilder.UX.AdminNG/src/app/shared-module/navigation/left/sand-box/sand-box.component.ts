import { Component, OnInit } from '@angular/core';
import {
  SharedDataService
} from '@global';
import { SandBoxModel } from './sand-box.model';
import { NavigationService } from '../../navigation.service';
@Component({
  selector: 'navigation-left-sandbox',
  templateUrl: './sand-box.component.html',
  styleUrls: ['./sand-box.component.css']
})
export class NavigationLeftSandBoxComponent implements OnInit {
  public sandBoxModel: SandBoxModel;
  constructor(
    private _sharedData: SharedDataService,
    private _navigationService: NavigationService
  ) { }
  ngOnInit() {
    this.sandBoxModel = new SandBoxModel();
    this.fetchloggedInUserData();
  }
  public fetchloggedInUserData = () => {
    this.sandBoxModel.tenantName = this._sharedData._sharedData.items.ctTaContext.name;
    this._navigationService.fetchLeftNavigationHamburgerMenu().subscribe(successResponse => {
        this.sandBoxModel.launchpad = successResponse[5].label;
    })
  }
}