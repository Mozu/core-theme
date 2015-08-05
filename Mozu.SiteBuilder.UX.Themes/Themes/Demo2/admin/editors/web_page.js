Ext.widget({
    xtype: 'mz-form-webpage',
    initComponent: function () {
    
        this.containers.push({
            xtype: 'panel',
            collapsible: 'true',
            ui: 'subform',
            title: 'Active Date Range',
            itemId: 'activeDateRangePanel',
        
            items: [{
                xtype: "mz-input-date",
                name: "document.startDate",
                fieldLabel: 'Start Date'
            }, {
                xtype: "mz-input-date",
                name: "document.endDate",
                fieldLabel: 'End Date'
            }]
        });
        this.superclass.initComponent.apply(this, arguments);
    }
});
