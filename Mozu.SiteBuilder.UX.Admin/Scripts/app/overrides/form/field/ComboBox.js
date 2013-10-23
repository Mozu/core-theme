/*
 Override of Ext.form.field.ComboBox
*/

Ext.define('Taco.overrides.form.field.ComboBox', {
    override: 'Ext.form.field.ComboBox',
    /*
    * Gets array of selected combobox records and extracts the record.data.
    * Used when the persisted data structure is an array of objects instead of an array of id's
    *
    * returns array of record data objects
    */
    getValueRecordsData: function () {    
        var records = this.getValueRecords();
        var data = [];
        Ext.Array.each(records, function (record) {            
            data.push(record.data);
        });        
        return data;
    }    
});
