import { 
  Component, 
  OnInit,
  Input 
} from '@angular/core';

import { NavigationContainerType } from '@shared/infrastructure/enums';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class AppHomeComponent implements OnInit {

  @Input('navContainerType') navContainerType : NavigationContainerType;

  constructor() { }

  ngOnInit() {
  }

}
