/**
* @class Taco.core.ux.SimpleEditor
* @author Jason Cochran
* The simple editor base class
*/

    Ext.define('Taco.core.ux.SimpleEditor', {
        extend: 'Ext.window.Window',
        alias: 'widget.simpleeditor',
        width: 400,
        layout: 'fit',
        autoShow: true,
        data: null,
        editMode: false,
        modal: false,

        onSave: function (model) {
            this.close();
        },
        
        onCancel: function () {
            this.close();
        },

        initComponent: function () {
            this.callParent(arguments);
        }
    });