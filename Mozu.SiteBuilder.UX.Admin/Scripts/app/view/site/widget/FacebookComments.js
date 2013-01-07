/**
 * @class Taco.view.site.widget.FacebookComments
 */
Ext.define('Taco.view.site.widget.FacebookComments', {
    extend: 'Taco.view.site.widget.Editor',

    title: 'Facebook Comments',

    initComponent: function () {

        this.items = [{
            xtype: 'slider',
            fieldLabel: 'Number of posts to display',
            labelSeparator: '',
            labelAlign: 'top',
            name: 'count',
            value: 2,
            width: 250,
            increment: 1,
            minValue: 1,
            maxValue: 10
        }
        , {
            xtype: 'fieldcontainer',
            fieldLabel: 'Color scheme',
            labelSeparator: '',
            labelAlign: 'top',
            defaultType: 'radiofield',
            defaults: {
                flex: 1,
                name: 'theme'
            },
            items: [{
                boxLabel: 'Light',
                inputValue: 'light'
            }, {
                boxLabel: 'Dark',
                inputValue: 'dark'
            }]
        }];

        this.callParent(arguments);
    },

    initWidgetConfig: function () {
        return {
            count: 5,
            theme: 'light'
        };
    }
});