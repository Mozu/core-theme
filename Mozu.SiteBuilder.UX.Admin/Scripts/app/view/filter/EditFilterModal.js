
/**
 * @class Taco.view.pendingChange.publishSet.PublishSetEditor.js
 */

Ext.define('Taco.view.filter.EditFilterModal', {
    //extend: 'Taco.core.ux.window.Modal',
    extend: 'Taco.core.ux.window.Drawer',
    requires: [
        'Taco.model.ExpressionTree',
        'Taco.view.filter.Form'
    ],

    modelName: 'Taco.model.ExpressionTree',

    form: 'Taco.view.filter.Form',

    autoShow: true,

    title: "Edit Condition",

    record: null,

    scale: "large",

    layout: "fit",

    config: {
        // DynamicPreComputed or DynamicRealTime
        type: null
    },

    initComponent: function (eOpts) {
        var me = this;

        this.form = Ext.create(me.form, {
            type: this.getType(),
            record: me.record
        });

        this.items = [this.form];

        this.callParent(arguments);
    },

    doSave: function () {

        if (this.form.beforeSave(this)) {
            this.saveSuccess(this.record);
        }

    },

    /**
    * Do any class level cleanup. Destroy and null any scoped refs.     
    */
    onDestroy: function (destroy) {
        this.callParent(arguments);
    }
});
