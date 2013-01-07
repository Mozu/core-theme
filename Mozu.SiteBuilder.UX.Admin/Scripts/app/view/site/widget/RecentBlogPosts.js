/**
 * @class Taco.view.site.widget.RecentBlogPosts
 *  This class is the Editor Modal for the Recent Blog Posts Widget
 */
Ext.define('Taco.view.site.widget.RecentBlogPosts', {
    extend: 'Taco.view.site.widget.Editor',

    title: 'Recent Posts',

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
                    xtype: 'slider',
                    name: 'postCount',
                    fieldLabel: 'Number of Links',
                    labelClsExtra: 'taco-first',
                    width: 100,
                    increment: 1,
                    minValue: 1,
                    maxValue: 10
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
    },

    initWidgetConfig: function () {
        return {
            postCount: 3,
            alignment: 'left'
        };
    }
});
