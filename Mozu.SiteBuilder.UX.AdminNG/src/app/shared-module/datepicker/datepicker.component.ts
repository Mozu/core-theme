import {Component, ElementRef, forwardRef, Input, ViewChild } from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'datepicker',
  templateUrl: './datepicker.component.html',
  styleUrls: ['./datepicker.component.css'],
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => DatepickerComponent), multi: true }]
})

export class DatepickerComponent implements ControlValueAccessor {
  @Input() name = '';
  @Input() model: any;
  @ViewChild('dp') dp;
  today = new Date();
  private propagateChange: any = () => {};

  constructor() { }

  onModelChange(event?) {
    this.model = event ? event : null;
    this.propagateChange(this.model);
    this.dp.close();
  }

  writeValue(value) {
      this.model = value;
  }

  registerOnChange(fn) {
    this.propagateChange = fn;
  }

  registerOnTouched() {}
}
