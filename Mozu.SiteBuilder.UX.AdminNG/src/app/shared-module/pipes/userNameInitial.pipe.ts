import {
    Pipe,
    PipeTransform
} from '@angular/core';
import { SharedDataService } from '@global';

@Pipe({ name: 'userinitial' })
export class UserNameInitial implements PipeTransform {
    constructor(private _sharedData : SharedDataService) {
    }
    transform(userNameInitials: string): string {
        userNameInitials = this._sharedData._sharedData.items.ctUser.firstName.charAt(0) + this._sharedData._sharedData.items.ctUser.lastName.charAt(0);
       return userNameInitials;
    }
}