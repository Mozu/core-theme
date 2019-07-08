import { Component, 
    OnInit } from '@angular/core';
  import { Router, PRIMARY_OUTLET, UrlSegmentGroup, UrlSegment } from '@angular/router';  
import { NotificationService } from '@global';
import { Constants, NotificationLGActions } from '@shared/infrastructure';
import { TopLocationGroupsModel, TopLocationGroupConfigModel } from './top-location-groups.model';

  @Component({
    selector: 'navigation-top-location-groups',
    templateUrl: './top-location-groups.component.html',
    styleUrls: ['./top-location-groups.component.css']
  })
  export class NavigationTopLocationGroupsComponent implements OnInit {

    public model: TopLocationGroupsModel;
    subscriptions = [];

    constructor(private router: Router,
      private _notificationService: NotificationService) {
    }

    ngOnInit() {
      this.model = new TopLocationGroupsModel();
      this.model.locationGroupURL = Constants.uiRoutes.locationGroups;
      this.model.isEditMode = false;
      this.model.isConfigTabVisible = false;
      this.checkMode();

      this.subscriptions.push(
        this._notificationService.locationGroupAdded.subscribe((action: any) => {
            if (action === NotificationLGActions.saved || action === NotificationLGActions.cancelled) {
              this.model.isEditMode = false;
              this.model.isConfigTabVisible  = false;
            }
        })
      );

      this.subscriptions.push(
        this._notificationService.LocationGroupConfig.subscribe((action: any) => {
          if (action.name === NotificationLGActions.list) {
            this.model.isEditMode = true;
            this.model.isConfigTabVisible  = true;
            this.model.locationGroupName = (action.data as TopLocationGroupConfigModel).locationGroupName;
            this.model.locationGroupId = (action.data as TopLocationGroupConfigModel).locationGroupId;
          }
        })
      );
    }

    ngOnDestroy() {
      this.subscriptions.forEach((s) => {
          s.unsubscribe();
      });
    }

    checkMode(){
        const urltree = this.router.parseUrl(this.router.url);
        const primary: UrlSegmentGroup = urltree.root.children[PRIMARY_OUTLET];
        const primarySegments: UrlSegment[] = primary.segments;
        
        if(primarySegments && primarySegments.length){
          const path =  primarySegments[0].path;
          if(path === Constants.uiRoutes.locationGroups){
            this.model.isEditMode = false;
            this.model.isConfigTabVisible  = false;
          }
          if(path === Constants.uiRoutes.locationGroupCreate){
            this.model.isEditMode = true;
            this.model.isConfigTabVisible  = false;
          }
          if(path === Constants.uiRoutes.locationGroupEdit){
            this.model.isEditMode = true;
            this.model.isConfigTabVisible  = true;
          }
        }
    }

    showCreateLG(){
      this.model.isEditMode = true;
      this.router.navigate(['/'+ Constants.uiRoutes.locationGroupCreate]);
    }
  
    cancelCreateLG(){
      this._notificationService.notifyLocationGroupAdded(NotificationLGActions.cancel);
    }

    saveCreateLG(){
      this._notificationService.notifyLocationGroupAdded(NotificationLGActions.save);
    }

    gotoLocationGroupList(){
      this.model.isEditMode = false;
      this.model.isConfigTabVisible  = false;
      this.router.navigate([Constants.uiRoutes.locationGroups]);
    }

    gotoLocationGroupEdit(){
      this.model.isEditMode = true;
      this.model.isConfigTabVisible  = true;
      this.router.navigate([Constants.uiRoutes.locationGroupEdit + '/' + this.model.locationGroupId]);
    }

    gotoLocationGroupConfig(){
      console.log('this.model--->', this.model);
      this.model.isEditMode = false;
      this.model.isConfigTabVisible  = true;
      this.router.navigate([Constants.uiRoutes.locationGroupConfig + '/' + this.model.locationGroupId]);
    }

  }
  