import {DomSanitizer  } from '@angular/platform-browser';
import {
    Pipe,
    PipeTransform
} from '@angular/core';

@Pipe({ name: 'safeHtml' })
export class SafeHtmlPipe implements PipeTransform {
    constructor(private sanitizer: DomSanitizer)  { }

    transform(html :any) {
        return this.sanitizer.bypassSecurityTrustHtml(html);
    }
}

