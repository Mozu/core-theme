# Account Hierarchy Web Component

This is a Custom Web Component developed using Angular Elements concept to render tree-view functionality. It also allows extensibility and integration with core-theme hyper-v and backbone technologies. It is developed using Angular 10.2
 
## What are Angular Elements / Web Components

By using Angular Elements you can package Angular components as custom elements, a web standard for defining new HTML elements in a framework-agnostic way.

The custom elements standard is currently supported by browsers like Chrome, Opera, and Safari. To be able to use it with Firefox and Edge poly-fills are available. With a custom element you can extend the set of available HTML tags. The content of this tag is then controlled by JavaScript code which is included in the page.

In order to keep track of all available custom elements the browser maintains a registry in which every elements needs to be registered first. In this registry the name of the tag is mapped to the JavaScript class which controls the behavior and the output of that element.

Links below provide more information about what are web components and how to build them.

 - https://angular.io/guide/elements
 - https://www.techiediaries.com/angular/angular-9-elements-web-components/
 - https://medium.com/@kitson.mac/wrapping-an-angular-app-in-a-custom-element-web-component-angular-element-in-4-simple-steps-ded3554e9006 
 - https://indepth.dev/posts/1116/angular-web-components-a-complete-guide

## Building Account Hierarchy Web Component

Account hierarchy web component was built using Angular 10. Follow steps below to build Account Hierarchy Web component.

### Prequisits

 - Install [Node JS V14.15.X](https://nodejs.org/en/download/)
 - Install Angular CLI v10.2.0 i.e.  `npm install -g @angular/cli@10.2.0`

### Build

1. Navigate to directory i.e. `cd <drive>:\Kibo\Source\Mozu\Mozu.CoreTheme\scripts\modules\b2b-account\account-hierarchy-webcomponent`
2. Inside navigated directory run command `npm install` to install all the npm packages. This will install below dependencies as they are listed inside `package.json`
	- `Angular Core and dependencies` with version 10.2.0
	- Angular elements i.e. `@angular/elements`- For Custom elements
	- Angular Tree Component i.e. `@circlon/angular-tree-component`
	- `fs-extra` and `concat`  for bundling webcomponent and its dependencies into a single JS
3. Once all packages are successfully installed, run command `npm run build:webcomponent` to build `account-hierarchy-webcomponent.js` file with web.

## Testing Account Hierarchy Web Component

### Test with Index.HTML

In order to test account hierarchy webcomponent outside of Mozu.core hypertemplate , we have added a HTML file that include `account-hierarchy-webcomponent.js` and passes dummy input data to component.

 - Navigate to `cd <drive>:\Kibo\Source\Mozu\Mozu.CoreTheme\scripts\modules\b2b-account\account-hierarchy-webcomponent\webcomponent` and ensure `account-hierarchy-webcomponent.js` is generated. 
 - Open `index.html` at the root of this directory in browser to test web component. 

**Note** *web component doesn't have a live reload capability so every-time you change the component code you will need to rebuild it with command `npm run build:webcomponent` and refresh index.html.*
  
### Test with Account Hierarchy Hyper Template  
Account hierarchy web component is integrated into current mozu.core theme. Below are some of the files changed in order to felicitate navigation.

 - [b2baccount.js](https://github.com/Mozu/core-theme/blob/feature/account-hierarchy/scripts/modules/b2b-account/b2b-account.js) - A new navigation link for ***Account Hierarchy*** 
 - [account-hierarchy.js](https://github.com/Mozu/core-theme/blob/feature/account-hierarchy/scripts/modules/b2b-account/account-hierarchy.js) New Module to load account hierarchy hyper template.
 - [account-hierarchy.hypr.live](https://github.com/Mozu/core-theme/blob/feature/account-hierarchy/templates/modules/b2b-account/account-hierarchy/account-hierarchy.hypr.live) New hyper template to load Account Hierarchy Web Component

#### To test with hyper template on developer machine Follow Steps below 
1. Build Account Hierarchy Web component using steps mentioned in build section
2. Make sure Account Hierarchy Web component loads successfully inside test index.html
3. Run `grunt build` at the root of Mozu.CoreTheme folder to ensure theme is compiled and bundled.
4. Make sure your are logged into respective environment i.e. dev01 / ngdev04 etc using admin@kibocommerce.com , just log in but don't do tenant selection on launchpad.
5. Run Mozu.Sitebuilder.sln from EcomNG/Mozu.Sitebuilder.Storefront repo , ignore error in the browser and in the same window navigate to http://localhost:57521/_gosite/21429 , this should open storefront page.
6. On the right top you will see a link to log in , click that and enter your storefront credentials.
7. After login you will see account hierarchy link on the left side , click that and you should be able to test account hierarchy web component