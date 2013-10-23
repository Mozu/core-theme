/*
 

*/

Ext.define('Taco.overrides.form.field.ComboBox', {
    override: 'Ext.form.field.ComboBox',
    requires: [
        
    ],    
    initComponent: function () {
        this.callParent(arguments);
    },
    
    getValueRecordsData: function () {    
        var records = this.getValueRecords();
        var data = [];
        Ext.Array.each(records, function (record) {            
            data.push(record.data);
        });        
        return data;
    }    
});
