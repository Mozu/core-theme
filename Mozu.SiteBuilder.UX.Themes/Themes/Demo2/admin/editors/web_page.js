Ext.widget({
    xtype: 'mz-form-webpage',
    initComponent() {
    
        this.containers.push({
            xtype: 'panel',
            collapsible: 'true',
            ui: 'subform',
            title: 'Efectivity Dating',
            itemId: 'effectivityDatePanel',
        
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
