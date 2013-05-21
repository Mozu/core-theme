/**
 * @class Taco.view.site.widget.TagCollection
 *  This class is the Editor Modal for the Tag Collection Widget
 */
Ext.define('Taco.view.site.widget.TagCollection', {
    extend: 'Taco.view.site.widget.Editor',

    title: 'Tags',

    initComponent: function () {
        
        this.fields = [{
            xtype: 'container',
            layout: {
                type: 'table',
                columns: 2
            },
            items: [{
                xtype: 'container',
                defaults: {
                    labelSeparator: '',
                    labelAlign: 'top'
                },
                width: 200,
                items: [{
                    xtype: 'fieldcontainer',
                    fieldLabel: 'Display',
                    labelClsExtra: 'taco-first',
                    items: [{
                        inputValue: 'all',
                        boxLabel: 'Show All',
                        xtype: 'radiofield',
                        name: 'displayAll',
                        listeners: {
                            change: this.onDisplayChange,
                            scope: this
                        }
                    }, {
                        xtype: 'container',
                        width: 200,
                        layout: 'hbox',
                        items: [{
                            xtype: 'radiofield',
                            inputValue: 'count',
                            boxLabel: 'Show&nbsp;',
                            name: 'displayAll'
                        }, {
                            xtype: 'numberfield',
                            name: 'displayCount',
                            minValue: 0,
                            width: 60,
                            disabled: this.widgetConfig.displayAll === 'all',
                            hideTrigger: true,
                            keyNavEnabled: false,
                            mouseWheelEnabled: false
                        }]
                    }]
                }, {
                    xtype: 'fieldcontainer',
                    fieldLabel: 'Format',
                    name: 'format',
                    defaults: {
                        xtype: 'radiofield',
                        name: 'format'
                    },
                    items: [{
                        inputValue: 'inline',
                        boxLabel: 'Inline'
                    }, {
                        inputValue: 'cloud',
                        boxLabel: 'Tag Cloud'
                    }]
                }, Ext.create('Taco.core.ux.form.TextAlignment', {
                    name: 'alignment',
                    labelSeparator: '',
                    labelAlign: 'top',
                    width: 100,
                    defaults: {
                        name: 'alignment'
                    }
                })]
            }, {
                xtype: 'component',
                cls: 'taco-widget-editor-preview',
                html: 'Preview'
            }]
        }];

        this.callParent(arguments);

        this.displayCountField = this.form.down('numberfield');
    },

    initWidgetConfig: function () {
        return {
            displayAll: 'all',
            displayCount: 5,
            format: 'inline',
            alignment: 'left'
        };
    },
    buildWidgetConfig:function(){
        var config = this.callParent(arguments);
        config.displayCount = parseInt( config.displayCount , 10);
        return config;
    },

    onDisplayChange: function (field, newValue) {
        if (!this.displayCountField) {
            return;
        }
        this.displayCountField.setDisabled(newValue);
    }
});
