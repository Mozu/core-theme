Ext.define('Taco.view.attribute.modal.SelectGenericAttributeModal', {
    extend: 'Taco.core.ux.window.Modal',
    requires: [
        'Taco.core.ux.form.TextField',
        'Ext.ux.form.field.BoxSelect',
        'Taco.store.GenericAttribute'
    ],

    autoShow: true,
    closeAction: 'destroy',
    primaryText: 'Update',
    secondaryText: 'Cancel',
    scale: 'medium',
    layout: {
        type: 'fit'
    },

    initComponent: function () {
        var me = this;
        var storeCfg = {
            type: 'Taco.store.GenericAttribute',
            extraParams: {
                responseGroups: ""
            }
        };

        me.store = Taco.core.data.StoreManager.getOrCreate(storeCfg);
        me.store.loadRawData(me.parent.genericAttributeData);

        me.selectOptionValues = Ext.create('Ext.ux.form.field.BoxSelect', {
            name: '',
            grow: true,
            growToLongestValue: false,
            fieldLabel: 'Selected',
            queryMode: 'local',
            displayField: 'value',
            valueField: 'id',
            layout: 'fit',
            width: '100%',
            flex: 1,
            margin: '20 25 0 0',
            store: me.store,
            hideTrigger: false,
            triggerOnClick: false,
            forceSelection: false,
            disableKeyFilter: true,
            typeAhead: true
        });
        this.fieldContainer = Ext.create('Ext.form.FieldContainer', {
            name: 'cancelOrder',
            monitorValid: true,
            width: '100%',
            items:
                [
                    {
                        xtype: 'container',
                        layout: 'vbox',
                        width: '100%',
                        defaults: {
                            style: {
                                margin: '0 20 0 0'
                            }
                        },
                        items: [me.selectOptionValues]
                    }
                ],
            scope: this
        }, this);

        this.items = [this.fieldContainer];

        this.callParent(arguments);
        var mappedGenericValues = me.record.get('mappedGenericValues');
        if (me.parent.isEdit() && me.parent.strikethroughAttributes && me.parent.strikethroughAttributes.length>0) {
            mappedGenericValues = mappedGenericValues.filter(function (item) {
                return !me.parent.strikethroughAttributes.includes(item);
            })
        }
        me.selectOptionValues.setValue(mappedGenericValues);
    }
});