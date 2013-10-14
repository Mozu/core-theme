/**
 * @class Taco.view.order.Edit
 */


Ext.define('Taco.view.location.Edit', {
    extend: 'Taco.core.ux.form.FullEditor',
    requires: [
        'Taco.view.order.Form'
    ],

    formCls: 'Taco.view.location.Form',

    initComponent: function () {
            
        
        //this.saveHidden = this.cancelHidden = this.record.get('orderStatus') !== 'Created';

        this.callParent(arguments);

        this.form.on('savesuccess', function() {
            
        });
    }
});