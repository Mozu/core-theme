const fs = require('fs-extra');
const concat = require('concat');
(async function build() {
const files = [
'./dist/account-hierarchy-webcomponent/runtime.js',
'./dist/account-hierarchy-webcomponent/polyfills.js',
'./dist/account-hierarchy-webcomponent/main.js',
]
await fs.ensureDir('webcomponent')
await concat(files, 'webcomponent/account-hierarchy-webcomponent.js');
//await fs.copyFile('./dist/account-hierarchy-webcomponent/styles.css', 'webcomponent/styles.css')
await fs.copy('../account-hierarchy-webcomponent/src/assets/', 'webcomponent/assets/' )
})()
