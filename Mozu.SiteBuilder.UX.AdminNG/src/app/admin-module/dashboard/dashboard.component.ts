import { 
  Component, 
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnDestroy
} from '@angular/core';
import {Subscription} from 'rxjs/Subscription';

import { NotificationService } from '@global'

import { 
  AccessTileModel ,
  AccessTileLink
} from '@shared/index';

@Component({
  selector: 'admin-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit, OnDestroy {

  isShowSystemTiles : boolean;
  systemTiles : AccessTileModel [];
  mainTiles : AccessTileModel [];
  subscriptions: Subscription[];

  constructor( 
    private _notificationService : NotificationService,
    private _changeDetecttionRef : ChangeDetectorRef
  ) { 
    this.isShowSystemTiles = true; 
    this.subscriptions = [];

    this.systemTiles = [];
    this.systemTiles.push(this.GetSystemTilesModel("Catalog"));
    this.systemTiles.push(this.GetSystemTilesModel("Order"));
    this.systemTiles.push(this.GetSystemTilesModel("Product"));
    this.systemTiles.push(this.GetSystemTilesModel("Items"));

    this.mainTiles =[];
    this.mainTiles.push(this.GetMainTilesModel("Product"));
    this.mainTiles.push(this.GetMainTilesModel("Items"));
    this.mainTiles.push(this.GetMainTilesModel("Catalog"));
    this.mainTiles.push(this.GetMainTilesModel("Order"));

  }

  ngOnInit() {
    this.subscriptions.push(
            this._notificationService.loadAccessTileCategories.subscribe((activeTab: string) => {
                this.isShowSystemTiles = (activeTab == "System");
                this._changeDetecttionRef.detectChanges();
            })
        );
  }

  ngOnDestroy() {
    this.subscriptions.forEach((s) => {
      s.unsubscribe();
    }); 
  }

  private GetSystemTilesModel(tileHeader : string) : AccessTileModel {

      let accessTileModel = new AccessTileModel();

      accessTileModel.sectionText = tileHeader;

      accessTileModel.sectionLinks= [];
      let sectionLink1 = new AccessTileLink();
      sectionLink1.linkDataText = "Product";
      sectionLink1.linkDataURL  = "javascript:void(0)";

      let sectionLink2 = new AccessTileLink();
      sectionLink2.linkDataText = "Categories";
      sectionLink2.linkDataURL  = "javascript:void(0)";
      
      let sectionLink3 = new AccessTileLink();
      sectionLink3.linkDataText = "Inventory";
      sectionLink3.linkDataURL  = "javascript:void(0)";

      
      let sectionLink4 = new AccessTileLink();
      sectionLink4.linkDataText = "Price List";
      sectionLink4.linkDataURL  = "javascript:void(0)";

      accessTileModel.sectionLinks.push(sectionLink1);
      accessTileModel.sectionLinks.push(sectionLink2);
      accessTileModel.sectionLinks.push(sectionLink3);
      accessTileModel.sectionLinks.push(sectionLink4);

    return accessTileModel;
  }

  private GetMainTilesModel(tileHeader : string) : AccessTileModel {

    let accessTileModel = new AccessTileModel();

    accessTileModel.sectionText =tileHeader;

    accessTileModel.sectionLinks= [];
    let sectionLink1 = new AccessTileLink();
    sectionLink1.linkDataText = "Product";
    sectionLink1.linkDataURL  = "javascript:void(0)";

    let sectionLink2 = new AccessTileLink();
    sectionLink2.linkDataText = "Categories";
    sectionLink2.linkDataURL  = "javascript:void(0)";
    
    let sectionLink3 = new AccessTileLink();
    sectionLink3.linkDataText = "Inventory";
    sectionLink3.linkDataURL  = "javascript:void(0)";
    
    let sectionLink4 = new AccessTileLink();
    sectionLink4.linkDataText = "Price List";
    sectionLink4.linkDataURL  = "javascript:void(0)";

    accessTileModel.sectionLinks.push(sectionLink1);
    accessTileModel.sectionLinks.push(sectionLink2);
    accessTileModel.sectionLinks.push(sectionLink3);
    accessTileModel.sectionLinks.push(sectionLink4);

    return accessTileModel;
  }

}