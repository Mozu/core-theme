/**
 * @class Taco.view.site.widget.Editor
 */
Ext.define('Taco.view.site.widget.Editor', {
    extend: 'Taco.core.ux.window.WindowWithActions',
    autoSize: true,
    scale: 'large',
    /**
     * @cfg {String} configName
     * The name of the widget config on the CMS Document
     */
    configName: 'widget_configuration',

    primaryText: 'OK',
    widgetEditData: null,

    constructor: function (cfg) {
        this.record = cfg.widgetEditData.model;
        this.widgetConfig = this.record.get('config');

        if (!this.widgetConfig) {
            this.widgetConfig = cfg.initWidgetConfig ? cfg.initWidgetConfig() : this.initWidgetConfig();
            this.record.set('config', this.widgetConfig);
        }
        
        this.callParent(arguments);
    },

    initComponent: function () {
        this.form = Ext.create('Ext.form.Panel', {
            bubbleEvents: ['dirtychange', 'validitychange'],
            cls: 'taco-widget-form',
            defaults: {
                xtype: 'textfield'
            },
            items:  this.fields,
            border: false,
            trackResetOnLoad: true
        });

        this.items = [this.form];

        this.callParent(arguments);

        this.on({
            save: this.onSave,
            scope: this
        });

        this.form.getForm().setValues(this.widgetConfig);
        this.form.getForm().trackResetOnLoad = false;
    },

    /**
     * Initializes the default values if the widget has no data yet
     * @return {Object} Default widget config to be loaded into the form.
     */
    initWidgetConfig: function () {
        return {};
    },

    /**
     * Builds the config object that will be saved to the widget.
     * @return {Object} New widget config to be saved.
     */
    buildWidgetConfig: function () {
        return this.form.getValues();
    },

    /**
     * Runs after the save button is clicked. Hides modal and fires
     * the 'aftersave' event
     */
    onSave: function () {
        
        var config = this.buildWidgetConfig();
        this.record.set('config', config);
        this.fireEvent('aftersave', this.widgetEditData);
        this.hide();
    }
});
