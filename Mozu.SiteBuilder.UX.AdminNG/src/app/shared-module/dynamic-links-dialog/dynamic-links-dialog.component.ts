import { 
Component, 
OnInit,
Input
} from '@angular/core';
import { SafeResourceUrl, DomSanitizer } from '@angular/platform-browser';
import * as _ from 'lodash';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { LoggerService } from '@core';
import { Constants } from '@shared/infrastructure/constants';

@Component({
  selector: 'app-dynamic-links',
  templateUrl: './dynamic-links-dialog.component.html',
  styleUrls: ['./dynamic-links-dialog.component.css']
})
export class DynamicLinksDialogComponent implements OnInit {

  @Input() iframeResourceURL : SafeResourceUrl;
  catalogImportExport = Constants.titles.catalogImportExportTitles;
  close = Constants.lables.closeLabel;
  constructor( 
    public activeModal: NgbActiveModal,
    public sanitizer: DomSanitizer,
    private _loggerService: LoggerService,
  ) {  }

  ngOnInit() { 
    this._loggerService.info("DynamicLinksDialogComponent : ngOnInit");
    let iframeSrc : any = this.iframeResourceURL;
    this.iframeResourceURL = this.sanitizer.bypassSecurityTrustResourceUrl(iframeSrc);
  }

  /**
   * closeModal
   */
  public closeModal = () => {
    this.activeModal.dismiss('Cross click')
  }

}
