import { Injectable } from "@angular/core";
@Injectable()
export class DateService {
  toDateField: any;
  fromDateField: any;
  constructor() {}

  setToDateField(control: any) {
    this.toDateField = control;
  }

  setFromDateField(control: any) {
    this.fromDateField = control;
  }

  getToDateField() {
    return this.toDateField;
  }

  getFromDateField() {
    return this.fromDateField;
  }
}