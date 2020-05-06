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
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-dynamic-links',
  templateUrl: './dynamic-links-dialog.component.html',
  styleUrls: ['./dynamic-links-dialog.component.css']
})
export class DynamicLinksDialogComponent implements OnChanges, AfterViewInit {
  @ViewChild('form') postForm: ElementRef;
  @Input() iframeResourceURL: any;
  @Input() dialogTitle: string;
  @Input() formBody: any;

  close = Constants.lables.closeLabel;

  constructor(
    private _http: HttpClient,
    private _loggerService: LoggerService,
    public activeModal: NgbActiveModal,
    private _domSanitizer: DomSanitizer
  ) { }

  ngOnChanges(changes: SimpleChanges) {
    this._loggerService.info('DynamicLinksDialogComponent : ngOnChanges');
    if (changes && changes.iframeResourceURL && changes.iframeResourceURL.currentValue) {
      this.iframeResourceURL = changes.iframeResourceURL.currentValue;
    }
    if (changes && changes.formBody && changes.formBody.currentValue) {
      this.formBody = changes.formBody.currentValue;
    }
    if (changes && changes.dialogTitle && changes.dialogTitle.currentValue) {
      this.dialogTitle = changes.dialogTitle.currentValue;
    }
  }

  ngAfterViewInit() {
    this._loggerService.info('DynamicLinksDialogComponent : ngAfterViewInit');
    this.postForm.nativeElement.submit();
  }

  submitForm($event): boolean {
    this._loggerService.info('DynamicLinksDialogComponent : submitForm');
    $event.stopPropagation();
    this.iframeResourceURL = this._domSanitizer.bypassSecurityTrustResourceUrl(this.iframeResourceURL);
    this._http.post(this.iframeResourceURL, this.formBody);
    return true;
  }

  /**
   * closeModal
   */
  public closeModal = () => {
    this.activeModal.dismiss('Cross click')
  }
}
