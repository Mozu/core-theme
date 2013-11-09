Ext.define('Taco.view.siteSelection.SiteView', {
    extend: 'Ext.view.View',
    alias: 'widget.taco.siteView',

    baseCls: Taco.baseCSSPrefix + 'grouped-view',
    cls: 'taco-theme-selector',
    disableSelection: true,
    itemSelector: '.theme-swatch',

    tpl: [
        '<tpl for=.>',
        '{[console.log(values)]}',
          /*  '<ul class="group">',
                //'<tpl for="children">',
                    '<li class="theme-swatch">',
                        '<ul class="menu">',
                            '<li class="title">',
                                '<span>{[values.data.name]}</span>',
                            '</li>',
                            '<li class="modes">',
                                '<tpl if="values.data.isDesktop">',
                                    '<div class="icon icon-desktop <tpl if="!values.data.isSelectedDesktop">inactive</tpl>"></div>',
                                    '<div class="text <tpl if="!values.data.isSelectedDesktop">inactive</tpl>">Desktop</div>',
                                '</tpl>',
                            '</li>',
                            '<li class="actions">',
                                '<a class="action-preview" href="#">Preview</a>',
                                '<a class="action-settings" href="#">Settings</a>',
                                '<a class="action-addons" href="#">Addons</a>',
                                '<tpl if="!values.data.isSelected">',
                                    '<a class="action-apply" href="#">Apply</a>',
                                '</tpl>',
                            '</li>',
                        '</ul>',
                        '<div class="title">{[values.data.name]}</div>',
                        '<img class="thumbnail" src="{[values.data.thumbnail]}">',
                    '</li>',
               // '</tpl>',
            '</ul>',*/
        '</tpl>'
    ],

    initComponent: function () {
        this.data = this.store;

        this.callParent(arguments);

        this.on({
            itemclick: {
                scope: this,
                fn: function (view, model, element, idx, e) {
                    e.preventDefault();
                }
            }
        });
    }
});
