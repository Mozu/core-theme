Ext.widget({
    xtype: 'mz-form-webpage',
    initComponent() {
    
        this.containers.push({
            xtype: 'panel',
            collapsible: 'true',
            ui: 'subform',
            title: 'Active Date Range',
            itemId: 'activeDateRangePanel',
        
            items: [{
                xtype: "mz-input-date",
                name: "document.activeDateRange.startDate",
                fieldLabel: 'Start Date'
            }, {
                xtype: "mz-input-date",
                name: "document.activeDateRange.endDate",
                fieldLabel: 'End Date'
            }]
        });
        this.superclass.initComponent.apply(this, arguments);
    }
});
