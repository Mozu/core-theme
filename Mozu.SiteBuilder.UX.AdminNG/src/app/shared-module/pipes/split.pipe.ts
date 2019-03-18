import {
    Pipe,
    PipeTransform
} from '@angular/core';

@Pipe({ name: 'split' })
export class SplitPipe implements PipeTransform {

    transform(inputString: string, splitString: string): string[] {
        return inputString.split(splitString);
    }
}