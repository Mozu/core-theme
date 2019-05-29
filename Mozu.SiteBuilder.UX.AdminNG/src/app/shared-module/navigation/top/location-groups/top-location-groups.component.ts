import { Component, 
    OnInit } from '@angular/core';
  import { Router, PRIMARY_OUTLET, UrlSegmentGroup, UrlSegment } from '@angular/router';  
import { NotificationService } from '@global';
import { Constants } from '@shared/infrastructure';

  @Component({
    selector: 'navigation-top-location-groups',
    templateUrl: './top-location-groups.component.html',
    styleUrls: ['./top-location-groups.component.css']
  })
  export class NavigationTopLocationGroupsComponent implements OnInit {
    
    createOrEditMode: boolean;
    subscriptions = [];

    constructor(private router: Router,
      private _notificationService:NotificationService) { 

    }
  
    ngOnInit() { 
      this.createOrEditMode = false;
      this.checkMode();

      this.subscriptions.push(
        this._notificationService.addLocationGroup.subscribe((action: string) => {
            if(action === "Save Success" || action === "Cancel Success"){
              this.createOrEditMode = false;
            }
            if(action === "Edit"){
              this.createOrEditMode = true;
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
            this.createOrEditMode = false;
          }
          if(path === Constants.uiRoutes.locationGroupCreate){
            this.createOrEditMode = true;
          }
          if(path === Constants.uiRoutes.locationGroupEdit){
            this.createOrEditMode = true;
          }
        }
    }

    showCreateLG(){
      this.createOrEditMode = true;
      this.router.navigate(['/locationGroupCreate']);
    }
  
    cancelCreateLG(){
      this._notificationService.notifyAddLocationGroup("Cancel");
    }

    saveCreateLG(){
      this._notificationService.notifyAddLocationGroup("Save");
    }
  }
  