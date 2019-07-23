import { Component,
         OnInit } from '@angular/core';
import { Router,
         PRIMARY_OUTLET,
         UrlSegmentGroup,
         UrlSegment } from '@angular/router';

import { NotificationService } from '@global';
import { Constants, NotificationLGActions } from '@shared/infrastructure';
import { TopLocationGroupsModel, TopLocationGroupConfigModel } from './top-location-groups.model';
import * as _ from 'lodash';

import { LoggerService, ErroNotificationType, ErrorCode, HttpError } from '@core';
import { TopLocationGroupsService } from './top-location-groups.service';

  @Component({
    selector: 'navigation-top-location-groups',
    templateUrl: './top-location-groups.component.html',
    styleUrls: ['./top-location-groups.component.css'],
    providers: [TopLocationGroupsService]
  })
  export class NavigationTopLocationGroupsComponent implements OnInit {
    public model: TopLocationGroupsModel;
    subscriptions = [];

    constructor(private router: Router,
      private _notificationService: NotificationService) {
    }

    ngOnInit() {
      this.model = new TopLocationGroupsModel();
      this.model.isEditMode = false;
      this.model.isConfigTabVisible = false;
      this.checkMode();

      this.subscriptions.push(
        this._notificationService.locationGroupAdded.subscribe((action: string) => {
            if (action === NotificationLGActions.saved || action === NotificationLGActions.cancelled) {
              this.model.isEditMode = false;
              this.model.isConfigTabVisible  = false;
            }
        })
      );

      this.subscriptions.push(
        this._notificationService.setLocationGroupConfigData.subscribe((action: any) => {
          if (action.name === NotificationLGActions.list) {
            this.model.isEditMode = true;
            this.model.isConfigTabVisible  = true;
            this.model.locationGroupName = (action.data as TopLocationGroupConfigModel).locationGroupName;
            this.model.locationGroupId = (action.data as TopLocationGroupConfigModel).locationGroupId;
          }
          if (action.name === NotificationLGActions.edit) {
            this.model.isEditMode = true;
            this.model.isConfigTabVisible  = true;
            const topLocationGroupConfigModel: TopLocationGroupConfigModel = action.data as TopLocationGroupConfigModel;
            this.model.locationGroupName = topLocationGroupConfigModel.locationGroupName;
            this.model.locationGroupId = topLocationGroupConfigModel.locationGroupId;
            if (topLocationGroupConfigModel.locationGroupSiteIds && topLocationGroupConfigModel.locationGroupSiteIds.length > 0) {
              this.model.locationGroupSelectedSiteId = topLocationGroupConfigModel.locationGroupSiteIds[0];
            }
            this.model.locationGroupSiteIds = topLocationGroupConfigModel.locationGroupSiteIds;
          }
        })
      );
    }

    ngOnDestroy() {
      this.subscriptions.forEach((s) => {
          s.unsubscribe();
      });
    }

    checkMode() {
        const urltree = this.router.parseUrl(this.router.url);
        const primary: UrlSegmentGroup = urltree.root.children[PRIMARY_OUTLET];
        const primarySegments: UrlSegment[] = primary.segments;

        if (primarySegments && primarySegments.length) {
          const path =  primarySegments[0].path;
          if (path === Constants.uiRoutes.locationGroups) {
            this.model.isEditMode = false;
            this.model.isConfigTabVisible  = false;
          }
          if (path === Constants.uiRoutes.locationGroupCreate) {
            this.model.isEditMode = true;
            this.model.isConfigTabVisible  = false;
          }
          if (path === Constants.uiRoutes.locationGroupEdit) {
            this.model.isEditMode = true;
            this.model.isConfigTabVisible  = true;
          }
          if (path === Constants.uiRoutes.locationGroupConfig) {
            this.model.isEditMode = false;
            this.model.isConfigTabVisible  = true;

            // this code executes only if user refresh the location config screen.
            if (primarySegments.length > 2) {
              const locationGroupId  = primarySegments[1].toString();
              const siteId = primarySegments[2].toString();
              this.model.locationGroupSelectedSiteId = siteId;
              if (this.model && _.isEmpty(this.model.locationGroupName)) {
                this.topLocationGroupsService.getLocationGroup(locationGroupId).subscribe(
                  (response) => this.getLocationGroupSuccess(response),
                  (response) => this.getLocationGroupError(response.error.message)
                );
              }
            }
          }
        }
    }

    showCreateLG() {
      this.model.isEditMode = true;
      this.router.navigate(['/' + Constants.uiRoutes.locationGroupCreate]);
    }

    cancelCreateLG() {
      this._notificationService.notifyLocationGroupAdded(NotificationLGActions.cancel);
    }

    saveCreateLG() {
      this._notificationService.notifyLocationGroupAdded(NotificationLGActions.save);
    }
  }
