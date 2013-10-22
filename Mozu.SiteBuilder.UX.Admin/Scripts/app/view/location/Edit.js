/**
 * @class Taco.view.order.Edit
 */


Ext.define('Taco.view.location.Edit', {
    extend: 'Taco.core.ux.form.FullEditor',
    requires: [
        'Taco.view.location.Form'
    ],

    formCls: 'Taco.view.location.Form',
    
    initComponent: function () {
        
        this.callParent(arguments);

        this.form.on('savesuccess', function() {
            
        });
    }
});