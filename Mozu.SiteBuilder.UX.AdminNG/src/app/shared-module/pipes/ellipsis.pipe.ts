import {
    Pipe,
    PipeTransform
} from '@angular/core';

@Pipe({
    name: 'ellipsis'
})
export class EllipsisPipe implements PipeTransform {
    transform(val : any, args:any) {
        if (args === undefined) {
            return val;
        }

        if (val != null && val.length > args) {
            return val.substring(0, args) + '...';
        } else {
            return val;
        }
    }
}


