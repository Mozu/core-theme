/**
 * @class Taco.view.productType.Edit
 * @author Jimmy Sanford
 */

Ext.define('Taco.view.productType.Edit', {
    extend: 'Taco.core.ux.form.FullEditor',
    requires: ['Taco.view.productType.Form'],
    
    formCls: 'Taco.view.productType.Form'
});