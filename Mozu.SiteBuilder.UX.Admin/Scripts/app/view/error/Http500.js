/**
 * @class Taco.view.error.Http500
 */
    Ext.define('Taco.view.error.Http500', {
        extend: 'Taco.core.ux.content.Container',
        initComponent: function () {
            var me = this;
            me.header = {
                title: 'Whoops!'
            };
            me.body = {
                html: ['<div class="{0}view-error">',
                        '<h1>500</h1>',
                        '<h2>Whoops!</h2>',
                        '<p class="{0}view-error-exp">It appears the inter-tubes are clogged. This error has been reported to our team. Please try to reload the page.</p>']
                        .join('')
                        .split('{0}')
                        .join(Taco.baseCssPrefix)
            };
            me.callParent(arguments);
        }
    });
