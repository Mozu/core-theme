Ext.define('Taco.view.customers.subform.Information', {
    extend: 'Taco.view.customers.subform.Subform',
    title: 'Shopper ID',
    cls: Taco.baseCSSPrefix + 'customer-profile',
    initComponent: function () {

        var me = this,
            data = this.record.getData();
        this.setTitle('Shopper Id:' + this.record.getId());
        me.taxExemptIdField = Ext.create('Ext.form.field.Text', {
            name: 'taxId',
            hidden: !data.taxExempt,
            width: 300,
            fieldLabel: 'Tax Exempt Code'
        });

        me.taxExamptField = Ext.create('Ext.form.FieldContainer', {
            items: [
                {
                    xtype: 'checkboxfield',
                    name: 'taxExempt',
                    boxLabel: 'Tax Exempt',
                    listeners: {
                        'change': {
                            fn: function (field, newValue, oldValue, eOpts) {
                                me.taxExemptIdField.setVisible(newValue);
                            },
                            scope: me
                        }
                    }
                },
                me.taxExemptIdField
            ]
        });

        this.items = [{
                xtype: 'container',
                width: 340,
                bodyPadding: '19 0',
                cls: 'customer-info',
                defaults: {
                    width:'100%'
                },
                items: [{
                        xtype: 'textfield',
                        name: 'firstName',
                        fieldLabel: 'First Name'
                    }, {
                        xtype: 'textfield',
                        name: 'lastName',
                        fieldLabel: 'Last Name'
                    }, {
                        xtype: 'textfield',
                        name: 'emailAddress',
                        fieldLabel: 'Email'
                    }, {
                        xtype: 'checkboxfield',
                        name: 'acceptsMarketing',
                        boxLabel: 'Yes, keep me up to date on store news and specials'
                    },
                    me.taxExamptField
                ]
            }, {
                xtype: 'container',
                width: 320,
                cls: 'customer-settings',
                items: [{
                        xtype: 'component',
                        width: 320,
                        cls: 'customer-history',
                        renderData: data,
                        renderTpl: [
                            '<div class="total-spent"><label>Lifetime Value</label><h2>{[Ext.util.Format.usMoney(values.totalSpent || 0)]}</h2></div>',
                            '<div class="total-orders"><label>Fulfilled Orders</label><h2>{[values.orderCount || 0]}</h2></div>',
                            '<div class="total-visits"><label>Total Visits</label><h2>{[values.visitCount || 0]}</h2></div>',
                            '<div class="total-orders"><span>Customer Since: </span><span>{[Ext.util.Format.date(values.createDate, "m/d/Y")]}</span></div>'
                        ]
                    }, {
                        xtype: 'button',
                        text: 'View Wish List',
                        cls: 'customer-wish-list-btn',
                        handler: function () {
                            //console.log(this.record);
                            var model = Ext.create('Taco.shared.view.modal.Wishlist', {
                                record: this.record
                            });
                        },
                        scope: this
                    }, {
                        xtype: 'button',
                        text: 'View Store Credit',
                        cls: 'customer-wish-list-btn',
                        handler: function () {
                            //console.log(this.record);
                            var model = Ext.create('Taco.shared.view.modal.StoreCredit', {
                                record: this.record
                            });
                        },
                        scope: this
                    }, {
                        store: this.segmentStore,
                        xtype: 'boxselect',
                        width: 320,
                        hideTrigger: false,
                        triggerOnClick: false,
                        forceSelection: true,
                        createNewOnEnter: false,
                        valueField: 'id',
                        displayField: 'code',
                        name: 'segmentIds',
                        queryMode: 'local',
                        fieldLabel: 'Segments',
                        cls: 'customer-history',
                        pageSize :10,
                        tpl: Ext.create('Ext.XTemplate',
       '<tpl for=".">',
            '<div class="x-boundlist-item">code:{code} - name:{name}</div>',
        '</tpl>'
    ),
                    }]
            }];

        this.callParent(arguments);
    }
});