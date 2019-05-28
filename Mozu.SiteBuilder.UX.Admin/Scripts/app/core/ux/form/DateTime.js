/**
 * @class Taco.core.ux.form.DateTime
 * Provides a date & time input field with a {@link Taco.core.ux.picker.DateTime date & time
 * picker} dropdown and automatic date & time validation.
 */
Ext.define('Taco.core.ux.form.DateTime', {
    extend: 'Ext.form.field.Date',
    alias: 'widget.datetime',
    requires: ['Taco.core.ux.picker.DateTime'],

    pickerAlign: 'tr-br?',
    pickerOffset: [0,7],
    emptyText: 'mm/dd/yy 12:00am',
    format: 'n/j/Y g:i a',

    initComponent: function () {
        if(this.value) {
            this.value = Ext.Date.format(new Date(this.value), this.format);
        } 
        
        this.callParent(arguments);

        this.addCls('taco-date-field');
    },

    expand: function () {        
        this.callParent(arguments);
    },

    createPicker: function() {
        var format = Ext.String.format;

        return new Taco.core.ux.picker.DateTime({
            pickerField: this,
            ownerCt: this.ownerCt,
            renderTo: Ext.getBody(),
            floating: true,
            hidden: true,
            focusOnShow: true,
            minDate: this.minValue,
            maxDate: this.maxValue,
            disabledDatesRE: this.disabledDatesRE,
            disabledDatesText: this.disabledDatesText,
            disabledDays: this.disabledDays,
            disabledDaysText: this.disabledDaysText,
            format: this.format,
            value:this.getValue(),
            showToday: this.showToday,
            startDay: this.startDay,
            minText: format(this.minText, this.formatDate(this.minValue)),
            maxText: format(this.maxText, this.formatDate(this.maxValue)),
            //border: false,
            shadow: false,
            width: 230,
            listeners: {
                scope: this,
                select: this.onSelect
            },
            keyNavConfig: {
                esc: this.collapse,
                scope: this
            }
        });
    },

    onSelect: function (picker, date) {
        this.setValue(date);
        this.fireEvent('select', this, date);
    }
});
