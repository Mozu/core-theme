import { 
    Component, 
    OnInit, 
    ChangeDetectionStrategy,
    EventEmitter, 
    Output, ChangeDetectorRef } from '@angular/core';

import { NotificationService } from '@global/services/notifications.service';
import { NavigationService } from '../navigation.service';
import { TopNavigationModel } from './top.model';

@Component({
  selector: 'navigation-top',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './top.component.html',
  styleUrls: ['./top.component.css']
})
export class NavigationTopComponent implements OnInit {

  public data : any;
  public model : TopNavigationModel;

  constructor(
      private navigationService : NavigationService,
      private changeDetectorRef : ChangeDetectorRef,
      private notificationService : NotificationService
      ) { }

  ngOnInit() {
    this.model = new TopNavigationModel();
    this.fetchHomeTabsName();
  }

  public tabSelectionChanged = (activeTab: any) => {
    this.notificationService.notifyLoadAccessTileCategories(activeTab.tabName);
  }

  public fetchHomeTabsName = () => {
    this.navigationService.fetchTabsName().subscribe(data => { 
     this.model.navigationTabs = JSON.parse(JSON.stringify(data));
     this.changeDetectorRef.detectChanges();
    }, err => {
      
    });

  }

  public fetchMainCategories = () => {
    
    this.navigationService.fetchCategories().subscribe(data => { 
     this.data = JSON.parse(JSON.stringify(data));
     this.changeDetectorRef.detectChanges();
    }, err => {
      this.data = [];
    //  this.displayGridErrorMessage(Messages.searchError.serverError);
    });
  }
  
}