import { Component,
         Input
} from '@angular/core';

import { SafeResourceUrl,
         DomSanitizer
} from '@angular/platform-browser';

import { LoggerService
} from '@core';

import { environment } from '@env';
import { Constants } from '@shared';
import { Router } from '@angular/router';

@Component({
  selector: 'app-fulfiller',
  templateUrl: './fulfiller.component.html',
  styleUrls: ['./fulfiller.component.css']
})

export class FulfillerComponent {
  fulFilleriframeSrc: string;
  @Input() iframeResourceURL: SafeResourceUrl;
  showUnifiedAdminButn: boolean = false;

  constructor(
    public sanitizer: DomSanitizer,
    private _logger: LoggerService,
    private router: Router
    ) {}

  ngOnInit() {
    this._logger.info('AppComponent : ngOnInit() ');
    this.fulFilleriframeSrc = environment.fulfillerUrl + Constants.uiRoutes.fulfillerHome;
    this.iframeResourceURL = this.sanitizer.bypassSecurityTrustResourceUrl(this.fulFilleriframeSrc);
  }

 public navigateToUnifiedAdmin = () => {
  this.router.navigate(['/']);
  }

  public onIframeLoaded = () => {
    setTimeout(() => {
      this.showUnifiedAdminButn = true;
    }, 1400);
  }
}
