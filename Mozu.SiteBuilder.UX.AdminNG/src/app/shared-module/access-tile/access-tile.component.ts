import { Component, 
  OnInit ,
  Input
} from '@angular/core';

import { AccessTileModel } from './access-tile.model'

@Component({
  selector: 'access-tile',
  templateUrl: './access-tile.component.html',
  styleUrls: ['./access-tile.component.css']
})
export class AccessTileComponent implements OnInit {

  @Input('Tiles') tileModel : AccessTileModel;

  constructor() { }

  ngOnInit() {
  }

}
