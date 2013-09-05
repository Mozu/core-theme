Ext.define('Taco.view.customers.subform.Information', {
    extend: 'Taco.view.customers.subform.Subform',
    title: 'Shopper ID',
    cls: Taco.baseCSSPrefix + 'customer-profile',
    initComponent: function () {
        
        var data = this.record;

        this.items = [{
            xtype: 'container',
            width: 340,
            bodyPadding: '19 0',
            cls: 'customer-info',
            items: [{
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
            }]
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
                    '<div class="customer-since"><span>Customer Since: </span><span>{[Ext.util.Format.date(values.createDate, "m/d/Y")]}</span></div>'
                ]
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