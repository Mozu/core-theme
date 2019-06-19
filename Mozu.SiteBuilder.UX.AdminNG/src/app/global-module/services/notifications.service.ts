import {
    Injectable
} from '@angular/core';

import { LoggerService } from '@core';

import { Subject } from 'rxjs/Subject';
import { MenuItem } from 'primeng/api';


@Injectable()
export class NotificationService {

    productAddedToCartNotification: Subject<null> = new Subject<null>();
    productAddedToCartFromDialogNotification: Subject<null> = new Subject<null>();
    disableUINotification: Subject<null> = new Subject<null>();
    loadAccessTileCategories: Subject<string> = new Subject<string>();
    locationGroupAdded: Subject<string> = new Subject<string>();
    locationGroupEdited: Subject<any> = new Subject<any>();
    mainMenuLinksFilteredByContextType: Subject<MenuItem[]> = new Subject<MenuItem[]>();

    // Confirmation Dialog Notification
    QuoteItemDeleteConfirmation: Subject<any> = new Subject<any>();
    LocationGroupDeleteConfirmation : Subject<any> = new Subject<any>();

    constructor(
        private _logger: LoggerService
    ) {
        this._logger.info('NotificationService : constructor');
    }

    notifyProductAddedToCart() {
        this._logger.info('NotificationService : notifyNonCatalogProductAddedToCart');
        this.productAddedToCartNotification.next();
    }

    notifyProductAddedToCartFromDialog() {
        this._logger.info('NotificationService : notifyNonCatalogProductAddedToCart');
        this.productAddedToCartFromDialogNotification.next();
    }

    notifyDisableUI() {
        this._logger.info('NotificationService : notifyDisableUI');
        this.disableUINotification.next();
    }

    notifyLoadAccessTileCategories(accesTileName: string){
        this._logger.info('NotificationService : notifyLoadAccessTileCategories');
        this.loadAccessTileCategories.next(accesTileName);
    }

    notifyLocationGroupAdded(actionName:string){
        this._logger.info('NotificationService : notifyLocationGroupAdded');
        this.locationGroupAdded.next(actionName);
    }
    
    notifyLocationGroupEdited(action:any){
        this._logger.info('NotificationService : notifyLocationGroupEdited');
        this.locationGroupEdited.next(action);
    }

    // Notify components for confirmation dialog
    notifyQuoteItemDeleteConfirmation(actionName: string) {
        this._logger.info('NotificationService : notifyQuoteItemDeleteConfirmation');
        this.QuoteItemDeleteConfirmation.next(actionName);
    }

    notifyMainMenuLinksFilteredByContextType(mainMenuLinks: MenuItem[]) {
        this._logger.info('NotificationService : notifyMainMenuLinksFilteredByContextType');
        this.mainMenuLinksFilteredByContextType.next(mainMenuLinks);
    }
}
