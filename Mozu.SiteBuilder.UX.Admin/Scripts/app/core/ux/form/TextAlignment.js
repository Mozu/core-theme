/**
 * This field will allow the user to select different text alignments
 * @class Taco.core.ux.form.TextAlignment
 */
Ext.define('Taco.core.ux.form.TextAlignment', {
    extend: 'Ext.form.FieldContainer',
    alias: 'widget.alignfield',
    layout: 'hbox',

    fieldLabel: 'Align',
    defaultType: 'radiofield',
    cls: 'taco-field-alignment',
    items: [{
        inputValue: 'left'
    }, {
        inputValue: 'center'
    }, {
        inputValue: 'right'
    }]
});