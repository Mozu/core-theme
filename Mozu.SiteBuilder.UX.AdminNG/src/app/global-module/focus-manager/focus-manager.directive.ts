import {
    Directive,
    ElementRef,
    HostListener,
    Input,
    Renderer,
    AfterViewInit
} from '@angular/core';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { NotificationService } from '../services/index';
import { FocusManagerModel } from './index';

@Directive({
    selector: '[focus-manager]',
})
export class FocusManager {

    focusIndexAttribute: string = "focusIndex";
    TabKey: number = 9;
    elementsWithFocusIndex: any[]
    parentElement: ElementRef;
    activeFocusIndex: number;
    facetElementsWithFocusIndex: any[];
    productSliderSlideIdSelector = "activeSlideId";
    productSliderItemCSSSClass = "item";
    productSliderActiveCSSSClass = "active";
    profileDropDownMenuCSSClass = "top-right-drp-down-menu";
    invoiceDropDownMenuCSSClass = "dropdown-toggle";
    receiveLinkMenuId = "lnkReceiveMenu";
    bodyTagName = "BODY";
    divTagName = "DIV";
    imageTagName = "IMG";
    tabIndexText = "tabIndex";
    tabIndexValue = "-1";
    checkBoxType = "checkbox";
    checkboxOffsetParentClass = "opt-filters";
    dataDismissAttribute: string = "data-dismiss";
    closeClass: string = "close";
    buttonTag: string = "BUTTON";
    previousActiveFocusStack: number[] = [];
    modalCloseButtonFocusIndex: number = 100000;
    modalDialogClass: string = "modal";
    isMenuOrDialogOpen: boolean = false;

    constructor(private el: ElementRef,
        private renderer: Renderer,
        private _notificationService: NotificationService
    ) {
        
        this.parentElement = el;
        this.elementsWithFocusIndex = [];
        this.facetElementsWithFocusIndex = [];
    }

    @HostListener('document:keydown', ['$event']) onKeyDown(event: any) {
        var keyCode = event.keyCode || event.which;

        var focusElement: any = null;

        if (keyCode == this.TabKey) {
            //if (this.isNavigateFromBegining()) {            
            this.activeFocusIndex = this.elementsWithFocusIndex.indexOf(document.activeElement);
            this.isMenuOrDialogOpen = this.elementsWithFocusIndex.length > 0 && parseInt(this.elementsWithFocusIndex[0].getAttribute(this.focusIndexAttribute)) > 1;
            if (this.activeFocusIndex == -1 && this.isMenuOrDialogOpen)
                this.activeFocusIndex = 0;
            //} 


            while (focusElement == null) {
                if (event.shiftKey) {
                    this.activeFocusIndex--;            
                    if (this.activeFocusIndex >= 0)
                        focusElement = this.elementsWithFocusIndex[this.activeFocusIndex];
                    else {
                        if (this.isMenuOrDialogOpen) {
                            this.activeFocusIndex = this.elementsWithFocusIndex.length - 1;
                            focusElement = this.elementsWithFocusIndex[this.activeFocusIndex];
                        }
                        else {
                            return;
                        }
                    }
                }
                else {
                    this.activeFocusIndex++;
                    if (this.activeFocusIndex < this.elementsWithFocusIndex.length)
                        focusElement = this.elementsWithFocusIndex[this.activeFocusIndex];
                    else {
                        if (this.isMenuOrDialogOpen) {
                            this.activeFocusIndex = 0;
                            focusElement = this.elementsWithFocusIndex[this.activeFocusIndex];
                        }
                        else {
                            return;
                        }
                    }
                }

                if (focusElement != null) {
                    if ((focusElement.disabled != null && focusElement.disabled == true) ||
                        (focusElement.offsetWidth === 0 && focusElement.offsetHeight === 0))
                        focusElement = null;
                    else if (focusElement.attributes[this.productSliderSlideIdSelector] != null && focusElement.attributes[this.productSliderSlideIdSelector].value != null &&
                        !this.isCurrentSlideActive(focusElement.attributes[this.productSliderSlideIdSelector].value)) {
                        focusElement = null;
                    }
                    else {
                        if (focusElement.type == this.checkBoxType && focusElement.offsetParent != null && focusElement.offsetParent.className == this.checkboxOffsetParentClass
                            && (this.facetElementsWithFocusIndex == null || (this.facetElementsWithFocusIndex != null && this.facetElementsWithFocusIndex.filter(x => x.attributes.focusIndex == focusElement.attributes.focusIndex)[0] == undefined))) {
                            this.facetElementsWithFocusIndex.push(focusElement);
                        }
                        event.preventDefault();
                        this.setFocusOnElement(focusElement);
                    }

                }
            }
        }
    }

    ngAfterViewInit() {
        this.buildElementsWithFocusIndex();
        
        this._notificationService.contentLoadedNotification.subscribe((data?: FocusManagerModel) => {
            if (data !== null && data !== undefined && data.element !== null && data.setPreviousActiveIndex && !data.restorePreviousActiveIndex) {
                this.previousActiveFocusStack.push(this.activeFocusIndex); 
            }
            if (data !== null && data !== undefined && data.hasRouteChange) {
                this.previousActiveFocusStack.push(this.activeFocusIndex); 
            }
            if (data !== null && data !== undefined && data.restorePreviousActiveIndex && data.setPreviousActiveIndex === undefined) {
                this.previousActiveFocusStack.push(this.activeFocusIndex); 
            }
            this.elementsWithFocusIndex = null;
            this.elementsWithFocusIndex = [];
            this.buildElementsWithFocusIndex(data);
        });        
    }


    private buildElementsWithFocusIndex(data?: FocusManagerModel) {
        var targetElement = data !== null && data !== undefined && data.element !== null && data.element !== undefined ? data.element.nativeElement : this.parentElement.nativeElement;
        this.populateAllElementsHavingFocusIndex(targetElement);
        if (data !== null && data !== undefined && data.isLazyLoadingEnabledUI == true)
            return;
        if (this.elementsWithFocusIndex.length > 0) {
            var arrayToSort = this.elementsWithFocusIndex;
            this.elementsWithFocusIndex = this.sortFocusElements(arrayToSort, false);
            if (((data === null || data === undefined) || (data.restorePreviousActiveIndex == true)) && this.previousActiveFocusStack.length > 0) {                
                var lastActiveIndex = this.previousActiveFocusStack.pop();
                if (lastActiveIndex !== 0 && this.activeFocusIndex !== 0) {
                    this.setFocusOnElement(this.getNextActiveElement(lastActiveIndex));
                }
            }
            else if (data !== null && data !== undefined && data.retainCurrentActiveIndex === true) {
                this.setFocusOnElement(this.elementsWithFocusIndex[this.activeFocusIndex]);
            }
            else {
                this.setFocusOnElement(this.elementsWithFocusIndex[0]);
                if (this.facetElementsWithFocusIndex != null && this.facetElementsWithFocusIndex.length == 0)
                    this.activeFocusIndex = 0;
            }
        }
    }

    private sortFocusElements(arrayToSort: any, isSortDescending: boolean) {
        var that = this;
        arrayToSort.sort(function (a: any, b: any) {
            if (isSortDescending) {
                return parseInt(b.getAttribute(that.focusIndexAttribute)) - parseInt(a.getAttribute(that.focusIndexAttribute));
            }
            return parseInt(a.getAttribute(that.focusIndexAttribute)) - parseInt(b.getAttribute(that.focusIndexAttribute));
        });
        return arrayToSort;
    }

    private getNextActiveElement(previousElementIndex: number): any {
        for (var i = previousElementIndex; i < this.elementsWithFocusIndex.length; i++) {
            if ((this.elementsWithFocusIndex[i].offsetWidth > 0 || this.elementsWithFocusIndex[i].offsetHeight > 0)) {
                this.activeFocusIndex = i;
                return this.elementsWithFocusIndex[i];
            }
        }
        this.activeFocusIndex = this.elementsWithFocusIndex.length - 1;
        return this.elementsWithFocusIndex[this.activeFocusIndex];
    }

    private setFocusOnElement(currentElement: any) : void {
        currentElement.focus();
    }

    private populateAllElementsHavingFocusIndex(currentElement: any): void {
        var isModalCloseButton = this.isModalCloseButton(currentElement);       
        if (this.hasValidFocusIndex(currentElement) || isModalCloseButton) {
                if (currentElement.tagName == this.divTagName || currentElement.tagName == this.imageTagName || currentElement.type == this.checkBoxType)
                    currentElement.setAttribute(this.tabIndexText, this.tabIndexValue);

                if (isModalCloseButton) {
                    currentElement.setAttribute(this.focusIndexAttribute, (this.getMaxFocusIndex() + this.modalCloseButtonFocusIndex)); //to push the close button to last position
                }
                this.elementsWithFocusIndex.push(currentElement);
            }
            if (currentElement.childElementCount > 0) {
                for (var i = 0; i < currentElement.childElementCount; i++)
                    this.populateAllElementsHavingFocusIndex(currentElement.children[i]);
            }
    }

    private getMaxFocusIndex(): number {
        if (this.elementsWithFocusIndex.length === 0) return 0;
        var arrayToSort = this.elementsWithFocusIndex;
        var sortedArray = this.sortFocusElements(arrayToSort, true);
        return sortedArray[0].getAttribute(this.focusIndexAttribute)
    }

    private hasValidFocusIndex(currentElement: any) : boolean {
        return (this.doesAttributeExists(currentElement, this.focusIndexAttribute) &&
            currentElement.attributes[this.focusIndexAttribute].value != "" && parseInt(currentElement.attributes[this.focusIndexAttribute].value) > 0);
    }

    private isModalCloseButton(currentElement: any): boolean {
        return (currentElement.tagName === this.buttonTag && this.doesAttributeExists(currentElement, this.dataDismissAttribute) &&
            currentElement.attributes[this.dataDismissAttribute].value === this.modalDialogClass && this.hasCssClass(currentElement, this.closeClass));
    }

    private hasCssClass(currentElement: any, classToSearch: string): boolean {
        return (currentElement.classList.length > 0 && currentElement.classList.contains(classToSearch));
    }

    private doesAttributeExists(currentElement: any, attributeName: string): boolean {
        return (currentElement.attributes.length > 0 && currentElement.attributes[attributeName] != null
            && currentElement.attributes[attributeName] != "");
    }

    private isCurrentSlideActive(slideId : string): boolean {
        var slide = document.getElementById(slideId);
        return (slide != null && slide.classList.contains(this.productSliderItemCSSSClass) && slide.classList.contains(this.productSliderActiveCSSSClass));
    }

    private isNavigateFromBegining(): boolean {
        return (document.activeElement.tagName != this.bodyTagName &&
            !document.activeElement.classList.contains(this.profileDropDownMenuCSSClass) &&
            !document.activeElement.classList.contains(this.invoiceDropDownMenuCSSClass) &&
            document.activeElement.id != this.receiveLinkMenuId);
    }
}