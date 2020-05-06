import {
    Pipe,
    PipeTransform
} from '@angular/core';

@Pipe({ name: 'dateTypecast'})

export class DateTypecastPipe implements PipeTransform {
  transform(value: string) {
      if (value) {
        return new Date(value);
      } else {
      return null;
      }

  }
}
