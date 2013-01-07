/**
 *  This class is the Editor Modal for the Blog Archive Widget
 *  @class Taco.view.site.widget.BlogArchive
 */
Ext.define('Taco.view.site.widget.BlogArchive', {
    extend: 'Taco.view.site.widget.Editor',

    title: 'Blog Archive',

    initComponent: function () {
        
        this.items = [{
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
                    items: [{
                        inputValue: true,
                        boxLabel: 'Show All',
                        xtype: 'radiofield',
                        name: 'showAll',
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
                            name: 'showAll'
                        }, {
                            xtype: 'numberfield',
                            name: 'displayCount',
                            minValue: 0,
                            width: 60,
                            disabled: this.widgetConfig.showAll === true,
                            hideTrigger: true,
                            keyNavEnabled: false,
                            mouseWheelEnabled: false
                        }]
                    }]
                }, {
                    xtype: 'fieldcontainer',
                    fieldLabel: 'Order',
                    name: 'sort',
                    defaults: {
                        xtype: 'radiofield',
                        name: 'sort'
                    },
                    items: [{
                        inputValue: 'asc',
                        boxLabel: 'Oldest First'
                    }, {
                        inputValue: 'desc',
                        boxLabel: 'Newest First'
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
        if ( this.widgetConfig.displayCount ===1000 ) {
            this.widgetConfig.displayCount = 5;
        }
        this.callParent(arguments);

        this.displayCountField = this.form.down('numberfield');
    },
    
    buildWidgetConfig: function () {
        var values = this.form.getValues();
        if( values.showAll ){
            values.displayCount = 1000;
        }
        return values;
    },
    initWidgetConfig: function () {
        return {
            showAll: true,
            displayCount: 5,
            sort: 'desc',
            alignment: 'left'
        };
    },

    onDisplayChange: function (field, newValue) {
        if (!this.displayCountField) {
            return;
        }
        this.displayCountField.setDisabled(newValue);
    }
});
