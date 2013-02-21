/**
 * @class Taco.view.product.Edit
 * @author Michael Speed Elder
 * Date: 1/21/13
 * Time: 3:02 PM
 *
 *
 */

Ext.define('Taco.view.product.Edit', {
    extend: 'Taco.core.ux.form.FullEditor',
    requires: [
        'Taco.view.product.Form'
    ],
    formCls: 'Taco.view.product.Form',

    initComponent: function () {
        this.formCfg = Ext.apply(this.formCfg || {}, { options: this.options });
        this.callParent(arguments);
    }
});