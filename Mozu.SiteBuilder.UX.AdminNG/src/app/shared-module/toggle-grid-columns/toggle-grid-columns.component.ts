import { Component,
  ViewChild,
  Output,
  EventEmitter,
  Input} from '@angular/core';
import { OverlayPanel } from 'primeng/overlaypanel';

@Component({
  selector: 'toggle-grid-columns',
  templateUrl: './toggle-grid-columns.component.html',
  styleUrls: ['./toggle-grid-columns.component.css']
})
export class ToggleGridColumnsComponent {
  @ViewChild('gridColumnToggle') gridColumnToggle: OverlayPanel;
  @Output() toggledGridColumn = new EventEmitter<any>();
  @Input('gridColumnHeader') gridColumnHeader : any;

  constructor() { }

  toggleGridColumns(event, col) {
    const index = this.gridColumnHeader.findIndex((e) => e.header === col.header);
    if (index === -1) {
      this.gridColumnHeader.push(col);
    } else {
      col.checked = event.currentTarget.checked;
      this.gridColumnHeader[index] = col;
    }
    this.toggledGridColumn.emit(this.gridColumnHeader);
  }
}
