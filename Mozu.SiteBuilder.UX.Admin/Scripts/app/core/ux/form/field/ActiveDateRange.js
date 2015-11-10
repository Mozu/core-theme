/**
 * @class Taco.core.ux.form.field.ActiveDateRange
 */

Ext.define('Taco.core.ux.form.field.ActiveDateRange', {
    extend: 'Ext.form.Panel',
    alias: ['widget.taco-activedaterangefield'],
    collapsible : 'true',
    ui: 'subform',
    title: 'Active Date Range',
    itemId: 'activeDateRangePanel',
    layout: {
                type: 'vbox',
                align : 'stretch'
            },
    initComponent: function() {
        this.items = [{
            xtype: 'mz-input-date',
            name: 'document.startDate',
            fieldLabel: 'Start Date',
            value: this.record.get('startDate')
        }, {
            xtype: 'mz-input-date',
            name: 'document.endDate',
            fieldLabel: 'End Date',
            value: this.record.get('endDate')
        }];
        
        this.callParent(arguments);
    }
});
