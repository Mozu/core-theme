import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { LoggerService } from '../services/logger.service';
import { 
    NgbModal, 
    ModalDismissReasons 
  } from '@ng-bootstrap/ng-bootstrap';

export class EnvironmentConfig {
    environmentName: string;
    apiTokenUrl: string;
    appUrl: string;
    domain: string;
}

@Injectable()
export class UtilityService {

    features: string = "width = 800, height = 580, top = 15, left == 15, location=no,directories=no,titlebar=no,status=no, toolbar = no, menubar = no, scrollbars = 1, resizable = 1, location = 0";
    environmentName: string;

    constructor(
        private _logger: LoggerService,
        private _config: EnvironmentConfig,
        private modalService: NgbModal
    ) {
        this._logger.info("UtilityService : constructor ");
        this.environmentName = _config.environmentName;
    }

    //First parameter URL is mandatory, other parameters are optional.
    public openInNewWindow = (url: string, target?: string, features?: string, replace?: boolean): Window => {
        this._logger.info("UtilityService : openInNewWindow");
        if (url != undefined && url != "") {
            features = (features != undefined && features != "") ? features : this.features;
            return window.open(url, target, features, replace);
        }
        else
        {
            return null;
        }
    }

    public openInNewTab = (url?: string, target?: string): void => {
        this._logger.info("UtilityService : openInNewTab");
        if (url != undefined && url != "") {
            window.open(url, target);
        }
    }

    public redirectToURL(href: string) {
        window.location.href = href;
    }

    public hideAppLoadingWidget(): void {
        var appLazyLoadingElement = document.getElementById("appInitloadingWidget");
        if (appLazyLoadingElement)
            appLazyLoadingElement.style.visibility = "hidden";
    }

    public showAppLoadingWidget(): void {
        var appLazyLoadingElement = document.getElementById("appInitloadingWidget");
        if (appLazyLoadingElement)
            appLazyLoadingElement.style.visibility = "visible";
    }
  
    public roundToNearestTenth(input: number ): number 
    {
        return (input % 10 <= 5) ? this.roundToLowerTenth(input) : this.roundToUpperTenth(input);
    }
    public roundToLowerTenth(input: number ) : number
    {
        return parseInt((input / 10).toString()) * 10;
    }
    public roundToUpperTenth(input: number ): number
    {
        return parseInt((input / 10).toString()) * 10 + 10;
    }             
    public floor(input: number, decimalPlaces: number ):number
    {
        return Math.floor(input * parseInt(Math.pow(10, decimalPlaces).toString()) / parseInt(Math.pow(10, decimalPlaces).toString()));
    }              
    public ceiling(input: number, decimalPlaces: number ):number
    {
        return Math.ceil(input * parseInt(Math.pow(10, decimalPlaces).toString())) / parseInt(Math.pow(10, decimalPlaces).toString());
    }
    public round(input: number, decimalPlaces: number): number {
        return Math.round(input * parseInt(Math.pow(10, decimalPlaces).toString())) / parseInt(Math.pow(10, decimalPlaces).toString());
    }
    public contains(array: string[], searchTerm: string): boolean {
        for (var i = 0; i < array.length; i++) {
            if (array[i].trim() == searchTerm) return true;
        }
        return false;
    }
    public filterLinksByBehaviorId  = (accessLinks  : any, loggedInUsersData : any) => {
        var loggedInUsersBehaviorIds =loggedInUsersData._sharedData.items.ctUser.behaviorIds;
        accessLinks  = this.pruneInvalidLinks(accessLinks);
        var allFilteredLinks = [];
        var isMenuVisible = false;
        allFilteredLinks = _.filter(accessLinks , function(v : any) { 
        if( v.visible) {
            if (v.behaviorIds) { 
                isMenuVisible = (loggedInUsersBehaviorIds.includes(v.behaviorIds) >= 0);
            }
            else {
                isMenuVisible = true;
            }
          return isMenuVisible;
        }
        });
    
        _.map(allFilteredLinks, function(el){
             var filteredSubItems = _.filter(el.items, function(el : any){
                if(el.visible) {
                    if (el.behaviorIds) { 
                        isMenuVisible = (loggedInUsersBehaviorIds.indexOf(el.behaviorIds) >= 0);
                    }
                    else {
                        isMenuVisible = true;
                    }
                    return isMenuVisible;
                }
            });
            el.items = filteredSubItems;
        });

      //  allFilteredLinks = this.mergeImportExportLinks(allFilteredLinks, loggedInUsersData);//import/export
      return allFilteredLinks;
    }
    
    public pruneInvalidLinks = (accessLinks : any) => { 
        return accessLinks.filter(function(v : any) { return (v.id != 'localization' ); });
    }

    
    public distictImportExportLinks = (loggedInUsersData : any) => {
        let distinctImportExportLinks= _.uniqBy(loggedInUsersData._sharedData.items.ctEntities, function (e : any) {
        return e.location;
     });
     return distinctImportExportLinks;
    }

    public mergeImportExportLinks = (allFilteredLinks  : any, loggedInUsersData : any) => {
        var DistinctImportExportLinks = this.distictImportExportLinks(loggedInUsersData);
        DistinctImportExportLinks = _.map(DistinctImportExportLinks, function(item){
            return {
            label: item.modalWindowTitle,
            // routerLink : 'integrations',
            navUrl : item.href,
            location: item.location,
            appId : item.appId,
            _isImportExportMenuLinks : true,
            command: function() {
                // const modalRef = this.modalService.open(ModalComponent);
                // modalRef.componentInstance.src = "hello";
            }, //primeng property to call function   
            };
    }); 

    for(var i=0; i<allFilteredLinks.length; i++) {
        _.filter(DistinctImportExportLinks, function(v) {
                        if(allFilteredLinks[i].id == v.location) {
                        v._isImportExportMenuLinks = true;
                        allFilteredLinks[i].items.push(v);
                        return true;
                        }
                    });
    }
    //  console.log(allFilteredLinks, "updated");
    return allFilteredLinks;
    }
       
}
