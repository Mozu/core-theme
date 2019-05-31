import {
    Injectable
} from '@angular/core';

import { LoggerService } from '@core';

import { Subject } from 'rxjs/Subject';


@Injectable()
export class NotificationService {

    productAddedToCartNotification: Subject<null> = new Subject<null>();
    productAddedToCartFromDialogNotification: Subject<null> = new Subject<null>();
    disableUINotification: Subject<null> = new Subject<null>();
    loadAccessTileCategories : Subject<string> = new Subject<string>();

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
}
