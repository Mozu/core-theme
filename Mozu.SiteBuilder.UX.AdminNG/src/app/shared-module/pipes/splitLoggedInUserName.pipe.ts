import {
    Pipe,
    PipeTransform
} from '@angular/core';
import { SharedDataService } from '@global';

@Pipe({ name: 'splitLoggedInUserName' })
export class SplitLoggedUserName implements PipeTransform {
    constructor(private _sharedData : SharedDataService) {
    }
    transform(splitLoggedInUserName: string): string {
        splitLoggedInUserName = this._sharedData._sharedData.items.ctUser.firstName +' '+ this._sharedData._sharedData.items.ctUser.lastName;
       return splitLoggedInUserName;
    }
}