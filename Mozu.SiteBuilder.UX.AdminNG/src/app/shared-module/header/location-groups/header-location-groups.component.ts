import {
  Component,
         OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  HostListener
} from '@angular/core';
import {
  Router,
         PRIMARY_OUTLET,
         UrlSegmentGroup,
         UrlSegment, 
  ActivatedRoute
} from '@angular/router';
import { NotificationService } from '@global';
import { Constants, NotificationLGActions } from '@shared/infrastructure';
import { TopLocationGroupsModel, TopLocationGroupConfigModel } from './header-location-groups.model';
import * as _ from 'lodash';
import { LoggerService, ErroNotificationType, ErrorCode, HttpError } from '@core';
import { HeaderLocationGroupsService } from './HeaderLocationGroupsService';
import { Location } from "@angular/common";
  @Component({
    selector: 'header-location-groups',
    templateUrl: './header-location-groups.component.html',
    styleUrls: ['./header-location-groups.component.css'],
  providers: [HeaderLocationGroupsService],
  changeDetection: ChangeDetectionStrategy.OnPush
  })

  export class HeaderLocationGroupsComponent implements OnInit, OnDestroy {
    public model: TopLocationGroupsModel;
    subscriptions = [];
    constructor(private router: Router,
      private location: Location, 
      private _notificationService: NotificationService,
      private route: ActivatedRoute,
      private _loggerService: LoggerService,
      private headerLocationGroupsService: HeaderLocationGroupsService,
      private _changeDetectorRef: ChangeDetectorRef) {        
    }
    ngOnInit() {      
      this.model = new TopLocationGroupsModel();
      this.model.locationGroupURL = Constants.uiRoutes.locationGroups;
      this.model.isEditMode = false;
      this.model.isConfigTabVisible = false;
      this.model.isShowLocationGroupList = false;      
      this._changeDetectorRef.detectChanges();      
      if(this.model.isShowLocationGroupTabActive)
        {
          this.model.isEditMode = true;
          this.model.isConfigTabVisible = true;
        }                     
          if (this.location.path().includes(Constants.uiRoutes.locationGroupCreate))
           {
            this.model.isEditMode = true;
            this.model.isConfigTabVisible = false;           
            this._changeDetectorRef.detectChanges();
          }

          if (this.location.path().includes(Constants.uiRoutes.locationGroups)) {
            this.model.isEditMode = false;
            this.model.isConfigTabVisible = false;
            this._changeDetectorRef.detectChanges();
          }

        this.subscriptions.push(  this.router.events.subscribe(val => {
            if (this.location.path().includes(Constants.uiRoutes.locationGroups)){
            if(this.model.isShowLocationGroupTabActive)
            {
              const primarySegments: UrlSegment[] = this.GetPath();
              if (primarySegments && primarySegments.length) {
              const path =  primarySegments[0].path;
              if (path === Constants.uiRoutes.locationGroups) {
              this.model.isEditMode = false;
              this.model.isConfigTabVisible  = false;
              this.model.isShowLocationGroupTabActive = false;
              if (!this._changeDetectorRef['destroyed'])
              this._changeDetectorRef.detectChanges();            
            }    
        }
        }       
    }
  }));

    this.model.isShowLocationGroupTabActive = false;
      this.checkMode();
      this.subscriptions.push(
        this._notificationService.locationGroupAdded.subscribe((action: any) => {
            if (action === NotificationLGActions.cancelled || action === NotificationLGActions.navigateFromLeftMenu) {
              this.model.isEditMode = false;
              this.model.isConfigTabVisible  = false;
          this.model.isShowLocationGroupTabActive = false;
          this._changeDetectorRef.detectChanges();
            }
        })
      );
      this.subscriptions.push(
          this._notificationService.setLocationGroupConfigData.subscribe((action: any) => {
          if (action.name === NotificationLGActions.list) {
            this.model.isEditMode = true;
            this.model.isConfigTabVisible  = true;
            this.model.isShowLocationGroupTabActive = true;
            this.model.locationGroupName = (action.data as TopLocationGroupConfigModel).locationGroupName;
              this.model.locationGroupId = (action.data as TopLocationGroupConfigModel).locationGroupId;
              this.model.locationGroupCode = (action.data as TopLocationGroupConfigModel).locationGroupCode;
          this._changeDetectorRef.detectChanges();
          }
          if (action.name === NotificationLGActions.edit) {
            this.model.isEditMode = true;
            this.model.isConfigTabVisible  = true;
          this.model.isShowLocationGroupTabActive = true;
            const topLocationGroupConfigModel: TopLocationGroupConfigModel = action.data as TopLocationGroupConfigModel;
            this.model.locationGroupName = topLocationGroupConfigModel.locationGroupName;
              this.model.locationGroupId = topLocationGroupConfigModel.locationGroupId;
              this.model.locationGroupCode = topLocationGroupConfigModel.locationGroupCode;
            if (topLocationGroupConfigModel.locationGroupSiteIds && topLocationGroupConfigModel.locationGroupSiteIds.length > 0) {
              this.model.locationGroupSelectedSiteId = topLocationGroupConfigModel.locationGroupSiteIds[0];
            }
            this.model.locationGroupSiteIds = topLocationGroupConfigModel.locationGroupSiteIds;
            if (!this._changeDetectorRef['destroyed'])
          this._changeDetectorRef.detectChanges();
          }
        })
      );
    }
    ngOnDestroy() {
      this.subscriptions.forEach((s) => {
          s.unsubscribe();
      });
    }
    
    checkMode()
    { const primarySegments: UrlSegment[] = this.GetPath();
      if (primarySegments && primarySegments.length) {
        const path =  primarySegments[0].path;      
      if (path === Constants.uiRoutes.locationGroupConfig) 
      {
        this.model.isEditMode = false;
        this.model.isConfigTabVisible  = true;
        this.model.isShowLocationGroupTabActive = false;
        // this code executes only if user refresh the location config screen.
        if (primarySegments.length > 2) 
        {
          const locationGroupCode  = primarySegments[1].toString();
          const siteId = primarySegments[2].toString();
          this.model.locationGroupSelectedSiteId = siteId;
          this.model.locationGroupCode = locationGroupCode;
          if (this.model && _.isEmpty(this.model.locationGroupName)) {
              this.headerLocationGroupsService.getLocationGroup(locationGroupCode).subscribe(
              (response) => this.getLocationGroupSuccess(response),
              (response) => this.getLocationGroupError(response.error.message)
            );
          }
        }
        if (!this._changeDetectorRef['destroyed'])
        this._changeDetectorRef.detectChanges();
      }
    }
    }  
    private GetPath() {
      const urltree = this.router.parseUrl(this.router.url);
      const primary: UrlSegmentGroup = urltree.root.children[PRIMARY_OUTLET];
      const primarySegments: UrlSegment[] = primary.segments;
      return primarySegments;
    }

    private getLocationGroupSuccess(result) {
      this._loggerService.info('HeaderLocationGroupsComponent : getLocationGroupSuccess' + JSON.stringify(result));
      if (result && result.items) {
         const lgModel = result.items;
         this.model.locationGroupId = lgModel.locationGroupId;
         this.model.locationGroupName = lgModel.name;
         this.model.locationGroupSiteIds = lgModel.siteIds;
         this._changeDetectorRef.detectChanges();
      }
    }
    private getLocationGroupError(errmsg: string) {
      this._loggerService.info('HeaderLocationGroupsComponent : getLocationGroupError');
      throw new HttpError(ErrorCode.GetLocationGroupDetailFailed, ErroNotificationType.Toaster);
    }
    showCreateLG() {
      this.model.isEditMode = true;     
      this.model.isShowLocationGroupList = true;
      this.router.navigate(['/' + Constants.uiRoutes.locationGroupCreate]);      
    }
    cancelCreateLG() {
      this._notificationService.notifyLocationGroupAdded(NotificationLGActions.cancel);
    }
    saveCreateLG() {
      this._notificationService.notifyLocationGroupAdded(NotificationLGActions.save);
    }
    gotoLocationGroupList() {
      this.model.isEditMode = false;
      this.model.isConfigTabVisible  = false;
    this.model.isShowLocationGroupTabActive = false;
    this._changeDetectorRef.detectChanges();
      this.router.navigate([Constants.uiRoutes.locationGroups]);
    }
    gotoLocationGroupEdit() {
      this.model.isEditMode = true;
      this.model.isConfigTabVisible  = true;      
    this.model.isShowLocationGroupTabActive = true;
     this.router.navigate([Constants.uiRoutes.locationGroupEdit + '/' + this.model.locationGroupCode]);
    this._changeDetectorRef.detectChanges();
    }
    gotoLocationGroupConfig() {
      this.model.isEditMode = false;
      this.model.isConfigTabVisible  = true;
    this.model.isShowLocationGroupTabActive = false;
      this.router.navigate([Constants.uiRoutes.locationGroupConfig + '/' + this.model.locationGroupCode
                            + '/' + this.model.locationGroupSelectedSiteId]);
    this.model.isShowLocationGroupTabActive = false;
    if (!this._changeDetectorRef['destroyed'])
    this._changeDetectorRef.detectChanges();
    }
    @HostListener('window:popstate', ['$event'])
    onPopState(event) {      
      if (this.model.isShowLocationGroupList) {
        this.model.isEditMode = false;
        this.model.isConfigTabVisible = false;
        this._changeDetectorRef.detectChanges();
      }

    }
    
}


