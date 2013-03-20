/**
 * @class Taco.core.ux.ComboFilter
 * @author Jimmy Sanford
 * 
 */
Ext.define('Taco.core.ux.ComboFilter', {
    extend: 'Ext.ux.form.field.BoxSelect',
    alias: 'widget.taco.combofilter',

    createNewOnEnter: true,
    forceSelection: false,
    grow: false,
    hideTrigger: true,
    queryMode: 'local',
    triggerOnClick: false,

    initComponent: function () {
        this.callParent(arguments);
    }
});