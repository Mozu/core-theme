/**
 * @class Taco.view.generalSettings.subform.About
 * @author Bradley Friemel
 * @date 6/10/2013
 *
 */

Ext.define('Taco.view.generalSettings.subform.About', {
    extend: 'Taco.view.product.subform.Subform',
    requires: ['Taco.core.ux.form.SelectField', 'Taco.store.TimeZones'],
    title: 'Time Settings',
    initComponent: function () {
        var me = this;
        this.defaults = {
            labelAlign: 'top',
            labelSeparator: ''
        };
        
        me.timeFormatSelect = {
            xtype: 'selectfield',
            name: 'timeFormat',
            fieldLabel: 'Time format',
            valueField: 'value',
            displayField: 'display',
            width: 185,
            store: Ext.create('Ext.data.ArrayStore', {
                fields: [{
                    name: 'value',
                    type: 'string'
                }, {
                    name: 'display',
                    type: 'string'
                }],
                data: [
                    ['h:mm:ss tt', '12 hour time format'],
                    ['H:mm:ss tt', '24 hour time format'],
                    ['hh:mm:ss tt', '12 hour w/ leading zeros'],
                    ['HH:mm:ss tt', '24 hour w/ leading zeros']
                ]
            })/*,
            value: me.settings.timeFormat*/
        };

        me.timeZoneSelect = {
            xtype: 'selectfield',
            name: 'timeZone',
            fieldLabel: 'Time zone',
            valueField: 'name',
            displayField: 'name',
            queryMode: 'local',
            width: 350,
            store: Ext.create('Taco.store.TimeZones', { autoLoad: true })/*,
            value: me.settings.timeZone*/
        };
        me.timeSettings = Ext.widget('panel', {
            layout: 'hbox',
            width: 960,
            defaults: {
                labelAlign: 'top',
                margin: '0 20 0 0'
            },
            items: [me.timeZoneSelect, me.timeFormatSelect]
        });


        this.items = [
            me.timeSettings, {
            xtype: 'checkbox',
            name: 'daylightSaving',
            //checked: me.settings.daylightSaving,
            boxLabel: 'Automatically adjust clock for daylight savings',
            boxLabelAlign: 'after'
        }];

        this.callParent(arguments);
    }
});
