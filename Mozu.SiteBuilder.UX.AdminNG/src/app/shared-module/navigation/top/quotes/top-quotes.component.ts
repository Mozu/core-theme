import {
  Component,
  OnInit,
  OnDestroy
} from '@angular/core';
import { Router,
  UrlSegmentGroup,
  PRIMARY_OUTLET,
  UrlSegment } from '@angular/router';
import { NotificationService } from '@global';
import { LoggerService } from '@core';
import { Constants } from '@shared/infrastructure/constants';
import { TopQuoteModel } from './top-quotes.model';
import { NotificationQuoteActions, NavigationContainerType } from '@shared/infrastructure/enums';

@Component({
  selector: 'navigation-top-quote',
  templateUrl: './top-quotes.component.html',
  styleUrls: ['./top-quotes.component.css']
})
export class NavigationTopQuotesComponent implements OnInit, OnDestroy {
  public model: TopQuoteModel;
  uiRoutes = Constants.uiRoutes.quotes;
  navigationType = NavigationContainerType;

  constructor(private _loggerService: LoggerService,
    private router: Router,
    private _notificationService: NotificationService) { }

  ngOnInit() {
    this._loggerService.info('NavigationTopQuotesComponent : ngOnInit');
    this.model = new TopQuoteModel();

    this.model.isEditMode = false;
    this.model.subscriptions = [];
    this.checkMode();

    this.model.subscriptions.push(
      this._notificationService.quoteEdited.subscribe((action: string) => {
          if (action === NotificationQuoteActions.edit) {
            this.model.isEditMode = true;
          }
          if (action === NotificationQuoteActions.list) {
            this.model.isEditMode = false;
          }
      })
    );

    this.model.subscriptions.push(
      this._notificationService.quoteHeaderValuesReceived.subscribe((event: any) => {
        this.model.quoteNumber = event.quoteNumber;
        this.model.quoteStatus = event.quoteStatus;
      })
    );
  }

  checkMode() {
    const urltree = this.router.parseUrl(this.router.url);
    const primary: UrlSegmentGroup = urltree.root.children[PRIMARY_OUTLET];
    const primarySegments: UrlSegment[] = primary.segments;

    if (primarySegments && primarySegments.length) {
      const path = primarySegments[0].path + (primarySegments[1] != null ? '/' + primarySegments[1].path : '');
      if (path === Constants.uiRoutes.quotes) {
        this.model.isEditMode = false;
      }
      if (path === Constants.uiRoutes.quotesEdit) {
        this.model.isEditMode = true;
      }
    }
  }

  ngOnDestroy() {
    this._loggerService.info('NavigationTopQuotesComponent : ngOnDestroy');
    this.model.subscriptions.forEach((s) => {
        s.unsubscribe();
    });
  }
}
