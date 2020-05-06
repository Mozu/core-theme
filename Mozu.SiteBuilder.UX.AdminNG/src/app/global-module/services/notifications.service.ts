import {
    Injectable
} from '@angular/core';

import { LoggerService } from '@core';
import { Subject } from 'rxjs/Subject';
import { NavigationContainerType } from '@shared';


@Injectable()
export class NotificationService {

    expandHamburgerMenuNotification: Subject<NavigationContainerType> = new Subject<NavigationContainerType>();
    collapseHamburgerMenuNotification: Subject<NavigationContainerType> = new Subject<NavigationContainerType>();
    productAddedToCartNotification: Subject<null> = new Subject<null>();
    productAddedToCartFromDialogNotification: Subject<null> = new Subject<null>();
    disableUINotification: Subject<null> = new Subject<null>();
    loadAccessTileCategories: Subject<string> = new Subject<string>();
    locationGroupAdded: Subject<any> = new Subject<any>();
    locationGroupEdited: Subject<any> = new Subject<any>();
    loadLeftMenuItems: Subject<any> = new Subject<any>();
    setLocationGroupConfigData: Subject<any> = new Subject<any>();
    leftMenuItemsLoaded: Subject<any> = new Subject<any>();
    quoteHeaderValuesReceived: Subject<any> = new Subject<any>();
    quoteSearched: Subject<any> = new Subject<any>();
    quoteEdited: Subject<any> = new Subject<any>();
    quoteListed: Subject<any> = new Subject<any>();
    quoteItemDeleted: Subject<any> = new Subject<any>();
    locationGroupDeleted: Subject<any> = new Subject<any>();

    // Confirmation Dialog Notification
    QuoteItemDeleteConfirmation: Subject<any> = new Subject<any>();
    LocationGroupDeleteConfirmation: Subject<any> = new Subject<any>();
    LGCUnSavedChangesConfirmation: Subject<any> = new Subject<any>();


    constructor(
        private _logger: LoggerService ) {
        this._logger.info('NotificationService : constructor');
    }

    notifyHamburgerMenuExpanded(containerType: NavigationContainerType) {
        this._logger.info('NotificationService : notifyHamburgerMenuExpanded');
        this.expandHamburgerMenuNotification.next(containerType);
    }
    notifyHamburgerMenuCollapsed(containerType: NavigationContainerType) {
        this._logger.info('NotificationService : notifyHamburgerMenuCollapsed');
        this.collapseHamburgerMenuNotification.next(containerType);
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

    notifyLoadAccessTileCategories(accesTileName: string) {
        this._logger.info('NotificationService : notifyLoadAccessTileCategories');
        this.loadAccessTileCategories.next(accesTileName);
    }

    notifyLocationGroupAdded(actionName: any) {
        this._logger.info('NotificationService : notifyLocationGroupAdded');
        this.locationGroupAdded.next(actionName);
    }

    notifyLocationGroupEdited(action: any) {
        this._logger.info('NotificationService : notifyLocationGroupEdited');
        this.locationGroupEdited.next(action);
    }

    notifySetLocationGroupConfigData(actionName: any) {
        this._logger.info('NotificationService : notifyLocationGroupConfig');
        this.setLocationGroupConfigData.next(actionName);
    }

    // Notify components for confirmation dialog
    notifyQuoteItemDeleted(actionName: string) {
        this._logger.info('NotificationService : notifyQuoteItemDeleted');
        this.quoteItemDeleted.next(actionName);
    }

    notifyLocationGroupDeleted(actionName: string) {
        this._logger.info('NotificationService : notifyLocationGroupDeleted');
        this.locationGroupDeleted.next(actionName);
    }

    notifyLeftMenuItemsLoaded(actionName: any) {
        this._logger.info('NotificationService : notifyLeftMenuItemsLoaded');
        this.leftMenuItemsLoaded.next(actionName);
    }
    // Notify Quote from search bar
    notifyQuoteSearched(action: string) {
        this._logger.info('NotificationService : notifyQuoteSearched');
        this.quoteSearched.next(action);
    }

    notifyQuoteEdited(action: any) {
        this._logger.info('NotificationService : notifyQuoteEdited');
        this.quoteEdited.next(action);
    }

    notifyQuoteListed(action: any) {
        this._logger.info('NotificationService : notifyQuoteListed');
        this.quoteListed.next(action);
    }

    notifyLGCUnSavedChangesConfirmation(action: any) {
        this._logger.info('NotificationService : notifyLGCUnSavedChangesConfirmation');
        this.LGCUnSavedChangesConfirmation.next(action);
    }

    notifyLoadLeftMenuItems(actionName: any) {
        this._logger.info('NotificationService : notifyLoadLeftMenuItems');
        this.loadLeftMenuItems.next(actionName);
    }

    notifyQuoteHeaderValuesReceived(quoteNumber: any, quoteStatus: any) {
        this._logger.info('NotificationService : notifyQuoteHeaderValuesReceived');
        this.quoteHeaderValuesReceived.next({quoteNumber: quoteNumber, quoteStatus: quoteStatus});
    }
    
}
