import { Component, 
    OnInit } from '@angular/core';
  import { Router, PRIMARY_OUTLET, UrlSegmentGroup, UrlSegment } from '@angular/router';  
import { NotificationService } from '@global';
import { Constants } from '@shared/infrastructure';
import { TopLocationGroupsModel } from './top-location-groups.model';

  @Component({
    selector: 'navigation-top-location-groups',
    templateUrl: './top-location-groups.component.html',
    styleUrls: ['./top-location-groups.component.css']
  })
  export class NavigationTopLocationGroupsComponent implements OnInit {
    
    public model : TopLocationGroupsModel;
    subscriptions = [];

    constructor(private router: Router,
      private _notificationService:NotificationService) { 

    }
  
    ngOnInit() {
      this.model = new TopLocationGroupsModel();
      
      this.model.isEditMode = false;
      this.checkMode();

      this.subscriptions.push(
        this._notificationService.addLocationGroup.subscribe((action: string) => {
            if(action === "Save Success" || action === "Cancel Success"){
              this.model.isEditMode = false;
            }
            if(action === "Edit"){
              this.model.isEditMode = true;
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
          }
          if(path === Constants.uiRoutes.locationGroupCreate){
            this.model.isEditMode = true;
          }
          if(path === Constants.uiRoutes.locationGroupEdit){
            this.model.isEditMode = true;
          }
        }
    }

    showCreateLG(){
      this.model.isEditMode = true;
      this.router.navigate(['/'+ Constants.uiRoutes.locationGroupCreate]);
    }
  
    cancelCreateLG(){
      this._notificationService.notifyAddLocationGroup("Cancel");
    }

    saveCreateLG(){
      this._notificationService.notifyAddLocationGroup("Save");
    }
  }
  