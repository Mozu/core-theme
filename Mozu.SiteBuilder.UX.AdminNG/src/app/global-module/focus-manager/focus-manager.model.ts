import {
    ElementRef
} from '@angular/core';

export class FocusManagerModel {
    element: ElementRef;
    setPreviousActiveIndex: boolean;
    restorePreviousActiveIndex: boolean;
    retainCurrentActiveIndex: boolean;
    hasRouteChange: boolean;
    isLazyLoadingEnabledUI: boolean;
}