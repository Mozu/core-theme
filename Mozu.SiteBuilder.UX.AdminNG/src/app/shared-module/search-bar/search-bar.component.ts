import { Component, Input } from '@angular/core';
import { NotificationService } from '@global';
import { NavigationContainerType } from '@shared/infrastructure';

@Component({
  selector: 'search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.css']
})
export class SearchBarComponent {
  @Input() navigationContainerType: string;
  @Input() isEditMode: boolean;
  navigationType = NavigationContainerType;

  status = false;
  constructor(private _notificationService: NotificationService) { }

  toggleIcon(searchBar: any) {
    this.status = searchBar.currentTarget.value.length > 0;
  }

  resetSerach(searchBar: HTMLInputElement) {
    searchBar.value = '';
    this.status = false;
    switch (this.navigationContainerType) {
      case NavigationContainerType.quotes:
        this._notificationService.notifyQuoteSearched(searchBar.value);
        break;
    }
  }

  search(value: string) {
    switch (this.navigationContainerType) {
      case NavigationContainerType.quotes:
        this._notificationService.notifyQuoteSearched(value);
        break;
    }
  }
}
