import { Injectable } from '@angular/core';
import { LoggerService } from '../services/logger.service';


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
        private _config: EnvironmentConfig
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
}
