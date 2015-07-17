
/**
 * @class Taco.view.pendingChange.publishSet.PublishSetEditor.js
 */

Ext.define('Taco.view.filter.EditFilterModal', {
    extend: 'Taco.core.ux.editor.ModalEditor',
    requires: [
        'Taco.model.ExpressionTree',
        'Taco.view.filter.Edit'
    ],

    modelName: 'Taco.model.ExpressionTree',

    editCls: 'Taco.view.filter.Edit',
    

    showActionsBar: false,

    entityId: null,

    record: null,    

    initComponent: function(eOpts) {
        var me = this;
        this.callParent(arguments);
    },

    /**
    * Do any class level cleanup. Destroy and null any scoped refs.     
    */
    onDestroy : function (destroy) {
        this.callParent(arguments);
    }
});
