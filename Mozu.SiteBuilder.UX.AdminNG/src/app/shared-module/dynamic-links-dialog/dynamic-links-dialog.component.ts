import {
  Component,
  Input,
  SimpleChanges,
  OnChanges,
  AfterViewInit,
  ViewChild,
  ElementRef
} from '@angular/core';
import { Http } from '@angular/http';
import * as _ from 'lodash';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { LoggerService } from '@core';
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
    private http: Http,
    private _loggerService: LoggerService,
    public activeModal: NgbActiveModal,
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
    $event.stopPropagation();
    this.http.post(this.iframeResourceURL, this.reqBody);
    return true;
  }

  /**
   * closeModal
   */
  public closeModal = () => {
    this.activeModal.dismiss('Cross click');
  }


}
