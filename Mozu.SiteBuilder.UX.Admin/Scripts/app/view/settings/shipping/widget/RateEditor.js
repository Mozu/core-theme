/**
 * @class Taco.view.settings.shipping.widget.RateEditor
 *
 */

Ext.define('Taco.view.settings.shipping.widget.RateEditor', {
    extend: 'Taco.core.ux.window.Modal',
    requires: [
    
    ],

    closeAction: 'destroy',
    autoShow: true,
    scale: 'large',
    createTitle: 'Create Custom Rate',
    editTitle: 'Edit Custom Rate',
    
    modelName: 'Taco.model.CustomShippingRate',
    
    initComponent: function() {
        var me = this;
        
        this.isCreate = false;
        if (!me.record) {
            me.record = Ext.create(me.modelName, {
                                
            });

            this.isCreate = true;
        }
        
        me.title = (this.isCreate) ? this.createTitle : this.editTitle;
        me.amountField = null;
        
        this.form = Ext.create('Taco.core.ux.form.Form', {
            requireDirty: false,
            layout: {
                type: 'anchor'
            },
            items: [{
                xtype: 'textfield',
                name: 'name',
                fieldLabel: 'Name',
                allowBlank: false,
                selectOnFocus: true,
                width: "100%"
            }, {
                xtype: 'fieldcontainer',
                // note this layout is required for radiogroups to have the proper height;
                layout: "column",
                items: [{
                    xtype: "radiogroup",
                    fieldLabel: "Custom Rate Type",
                    flex: 1,
                    name: "typeGroup",
                    layout: {
                        layout: "hbox"
                    },
                    columns: 1,
                    items: [
                        { xtype: "radiofield", boxLabel: "Flat Rate Per Item", inputValue: "CUSTOM_FLAT_RATE_PER_ITEM_EXACT_AMOUNT", id: "radio1", name: "type" },
                        { xtype: "radiofield", boxLabel: "Flat Rate Per Order", inputValue: "CUSTOM_FLAT_RATE_PER_ORDER_EXACT_AMOUNT", id: "radio2", name: "type" },
                        { xtype: "radiofield", boxLabel: "Percentage of Order", inputValue: "CUSTOM_PERCENTAGE_PER_ORDER", id: "radio3", name: "type" }
                    ]
                }]
            }, {
                xtype: 'numberfield',
                name: 'amount',
                fieldLabel: 'Amount',
                allowBlank: false,
                hideTrigger: true,
                keyNavEnabled: false,
                mouseWheelEnabled: false,
                width: 160
            },{
            xtype: 'textfield',
                name: 'id',
                fieldLabel: 'Custom Code',
                allowBlank: this.isCreate,
                selectOnFocus: true,
                width: "100%",
                validator: function (value) {
                    var store = me.list.getStore();
                    var ids = store.collect('id');

                    return !Ext.Array.contains(ids, value) || ((me.record === store.getById(value)) || 'Custom Code must be unique or empty');
                }
            }]
        });

        this.items = [this.form];
        
        this.form.getForm().setValues(me.record.getData());

        this.callParent(arguments);
        //this.amountField = this.form.findField('amount');
        //window.amountField = this.amountField;
        this.on({
            show: {
                scope: this,
                fn: function () {
                    var field = this.form.findField('name');
                    if (field && field.rendered) {
                        field.focus(true, 10);
                    }
                }
            }
        });
    },

    loadForm: function() {
        var me = this,
            form = me.getForm(),
            value = me.record.get("type"),
            fieldGroup = form.findField("typeGroup");

        // need to manualy set radio buttons. Auto setvalues in form.Form doesn't work.
        // radioButton.setValue() only works for a set of radio buttons when the value is a string instead of boolean. boolean values only set the first field with that field name.6 years later and extjs still screws radio buttons up.
        fieldGroup.setValue({
            "type": value
        });
        
        this.callParent(arguments);
    },

    doSave: function () {
        var me = this,
            data = me.form.getValues();

        me.record.set(data);
        me.saveSuccess(data);
    }
    
    //onDestroy: function () {
    //    this.form.destroy();
    //    this.form = null;
    //    this.callParent(arguments);
    //}
});
