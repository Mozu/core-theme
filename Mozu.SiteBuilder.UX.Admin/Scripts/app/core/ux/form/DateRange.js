/**
 * @class Taco.core.ux.form.DateRange
 * Provides a date range input field for two fields
 * For start field, must provide "endDateFieldName" in config.
 * For end date field, must provide "startDateFieldName" 
 * 
 * Example: 
 * { 
 *    xtype: 'daterange',
 *    name: 'minDate',
 *    endDateFieldName: 'maxDate'
 * }, { 
 *    xtype: 'daterange',
 *    name: 'maxDate',
 *    startDateFieldName: 'minDate'
 * }
 */
Ext.define('Taco.core.ux.form.DateRange', {
    extend: 'Ext.form.field.Date',
    alias: 'widget.daterange',

    startDateFieldName: null,
    endDateFieldName: null,

    invalidText: "{0} is not a valid date - it must be in the format mm/dd/yy",
    emptyText: 'mm/dd/yy',
    pickerOffset: 4,
  
    initComponent: function () {
        if (!this.startDateFieldName && !this.endDateFieldName) {
            console.error("Must populate either startDateFieldName or endDateFieldName");
        }
        this.on('change', this.onDateRangeChange, this);
        this.callParent(arguments);
    },

    //modified from http://docs.sencha.com/extjs/4.2.2/#!/example/form/adv-vtypes.html

    onDateRangeChange: function (field, val, oldVal, eOpts) {
        var date = field.parseDate(val),
            start,
            end;

        //invalid date.  Null value ok to clear max|min
        if (!date && val != null) {
            return false;
        }
        if (field.startDateFieldName) {
            start = field.previousSibling('[name="' + field.startDateFieldName + '"]');
            if (start == null) {
                return true;
            }
            start.setMaxValue(date);
            start.validate();
        } else if (field.endDateFieldName) {
            end = field.nextSibling('[name="' + field.endDateFieldName + '"]');
            if (end == null) {
                return true;
            }
            end.setMinValue(date);
            end.validate();
        }
        return true;
    },
});
