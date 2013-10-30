Ext.define('Taco.view.customers.subform.Information', {
    extend: 'Taco.view.customers.subform.Subform',
    title: 'Shopper ID',
    cls: Taco.baseCSSPrefix + 'customer-profile',
    initComponent: function () {
        
        var me= this,
            data = this.record;
        console.log(this.tagStore);
        me.taxExemptIdField = Ext.create('Ext.form.field.Text', {
            name: 'taxExemptId',
            hidden: !this.record.taxExempt,
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
                            fn: function(field, newValue, oldValue, eOpts) {
                                me.taxExemptIdField.setVisible(newValue);
                            },
                            scope:me
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
            items: [
                {
                    xtype: 'component',
                    width: 320,
                    renderData: data,
                    renderTpl: [
                        '<div class="info-name">{[values.primaryFirstName]} {[values.primaryLastName]}</div>',
                        '<div class="info-email"><span><a href="">{[values.primaryEmail]}</a></span></div>'  
                    ]
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
                    '<div class="total-spent"><label>Total Spent</label><h2>{[Ext.util.Format.usMoney(values.totalSpent || 0)]}</h2></div>',
                    '<div class="total-orders"><label>Total Orders</label><h2>{[values.orderCount || 0]}</h2></div>',
                    '<div class="total-orders"><label>Total Visits</label><h2>{[values.orderCount || 0]}</h2></div>',
                  //  '<div class="customer-since"><span>Customer Since: </span><span>{[Ext.util.Format.date(values.createDate, "m/d/Y")]}</span></div>',
                    
                '<div class="wishList"><label>View Wishlist</label></div>',
                '<div class="total-orders"><span>Customer Since: </span><span>{[Ext.util.Format.date(values.createDate, "m/d/Y")]}</span></div>'
                ]
            }, {
                xtype: 'button',
                text: 'View Wish List',
                cls: 'customer-history',
                handler: function () {
                    //console.log(this.record);
                    var model = Ext.create('Taco.shared.view.modal.Wishlist', {
                        record: this.record
                    });
                },
                scope: this
            }, {
                store: this.tagStore,
                xtype: 'boxselect',
                width: 320,
                hideTrigger: true,
                triggerOnClick: false,
                forceSelection: false,
                createNewOnEnter: true,
                valueField: 'Key',
                displayField: 'Value',
                name: 'groups',
                queryMode: 'local',
                fieldLabel: 'Groups',
                cls: 'customer-history'
            }]
        }];

        this.callParent(arguments);
    }
});