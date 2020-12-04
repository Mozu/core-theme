import {
  ApplicationRef,
  CUSTOM_ELEMENTS_SCHEMA,
  DoBootstrap,
  Injector,
  NgModule
} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AccountHierarchyComponent } from './account-hierarchy/account-hierarchy.component';
import { createCustomElement } from '@angular/elements';
import { TreeModule } from '@circlon/angular-tree-component';

@NgModule({
  declarations: [
    AccountHierarchyComponent
  ],
  imports: [
    BrowserModule,
    TreeModule
  ],
  providers: [],
  entryComponents: [
    AccountHierarchyComponent
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ]
})
export class AppModule implements DoBootstrap {

  constructor(private injector: Injector) {

  }

  ngDoBootstrap(appRef: ApplicationRef): void {
    const accountHierarchyWebComponent = createCustomElement(AccountHierarchyComponent, { injector: this.injector });
    customElements.define('account-hierarchy-webcomponent', accountHierarchyWebComponent);
  }
}