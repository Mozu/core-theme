import { 
Component, 
OnInit,
Input
} from '@angular/core';
import { SafeResourceUrl, DomSanitizer } from '@angular/platform-browser';
import { LoggerService } from '@core';

import { SharedDataService } from '@global/services/shared-data.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import * as _ from 'lodash';

@Component({
  selector: 'app-dynamic-links',
  templateUrl: './dynamic-links.component.html',
  styleUrls: ['./dynamic-links.component.css']
})
export class DynamicLinksComponent implements OnInit {

  @Input() src : SafeResourceUrl;
  
  constructor( 
    private _sharedData : SharedDataService,
    public activeModal: NgbActiveModal,
    public sanitizer: DomSanitizer,
    private _loggerService: LoggerService,
  ) {  }

  ngOnInit() { 
    this._loggerService.info("DynamicLinksComponent : ngOnInit");
    this.src = this.sanitizer.bypassSecurityTrustResourceUrl("https://integrations.ngdev06.kibong-dev.com/ImportExport/Catalog?" + this.src);
  }

}
