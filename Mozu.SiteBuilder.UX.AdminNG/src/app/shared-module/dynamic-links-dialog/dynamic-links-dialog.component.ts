import {
  Component,
  Input,
  SimpleChanges,
  OnChanges,
  AfterViewInit,
  ViewChild,
  ElementRef
} from '@angular/core';
import * as _ from 'lodash';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { LoggerService, HttpClientService } from '@core';
import { DomSanitizer } from '@angular/platform-browser';
import { Constants } from '@shared/infrastructure/constants';

@Component({
  selector: 'app-dynamic-links',
  templateUrl: './dynamic-links-dialog.component.html',
  styleUrls: ['./dynamic-links-dialog.component.css']
})
export class DynamicLinksDialogComponent implements OnChanges, AfterViewInit {
  @ViewChild('form') postForm: ElementRef;
  @Input() iframeResourceURL: any;
  catalogImportExport = Constants.titles.catalogImportExportTitles;
  close = Constants.lables.closeLabel;
  private reqBody: any;

  constructor(
    private _http: HttpClientService,
    private _loggerService: LoggerService,
    public activeModal: NgbActiveModal,
    private _domSanitizer: DomSanitizer
  ) {
    this.reqBody = new FormData();
  }

  ngOnChanges(changes: SimpleChanges) {
    this._loggerService.info('DynamicLinksDialogComponent : ngOnChanges');
    if (changes && changes.iframeResourceURL && changes.iframeResourceURL.currentValue) {

      this.iframeResourceURL = changes.iframeResourceURL.currentValue;
    }
  }

  ngAfterViewInit() {
    this._loggerService.info('DynamicLinksDialogComponent : ngAfterViewInit');
    this.postForm.nativeElement.submit();
  }

  submitForm($event): boolean {
    this._loggerService.info('DynamicLinksDialogComponent : submitForm');
    $event.stopPropagation();
    const url: any = this._domSanitizer.bypassSecurityTrustResourceUrl(this.iframeResourceURL);
    this._http.post(url, this.reqBody);
    return true;
  }

  /**
   * closeModal
   */
  public closeModal = () => {
    this.activeModal.dismiss('Cross click');
  }


}
