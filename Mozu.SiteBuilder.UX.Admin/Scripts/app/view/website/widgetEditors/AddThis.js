/**
 * @class Taco.view.site.widget.AddThis
 */
Ext.define('Taco.view.website.widgetEditors.AddThis', {
    extend: 'Taco.view.website.WidgetEditor',

    title: 'Add This',

    initComponent: function () {
        this.fields = [
            {
                xtype: 'fieldcontainer',
                fieldLabel: 'Style',
                defaultType: 'radiofield',
                defaults: {
                    flex: 1
                },
                layout: 'vbox',
                items: [
                    {
                        boxLabel: '16 pixel icons',
                        name: 'style',
                        inputValue: '1',
                        id: 'style1'
                    }, {
                        boxLabel: '32 pixel icons',
                        name: 'style',
                        inputValue: '2',
                        id: 'style2'
                    }, {
                        boxLabel: '16 pixel icons with counts',
                        name: 'style',
                        inputValue: '3',
                        id: 'style3'
                    }               
                ]
            },
            {
                xtype: 'box',
                html: 'Register with <a target="_blank" href="https://www.addthis.com">AddThis</a> for a free in-depth analytics reports and better understand your site\'s social traffic.'
            },
            {
                xtype: 'textfield',
                //labelStyle:"white-space:nowrap;",
                name: 'profileId',
                fieldLabel: 'AddThis<br/> profile ID',
                //labelWidth:150,
                allowBlank: true  // requires a non-empty value
            }
        ];
        this.callParent(arguments);
    },

    initWidgetConfig: function () {
        return {
            style: 1
        };
    }
});