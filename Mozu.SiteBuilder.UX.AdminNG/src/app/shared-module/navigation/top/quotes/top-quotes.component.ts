import { Component,
         OnInit } from '@angular/core';

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

  constructor() { }

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
