Ext.define('Taco.view.siteSelection.SiteView', {
    extend: 'Ext.view.View',
    baseCls: Taco.baseCSSPrefix + 'grouped-view',
    xtype: 'widget.taco.siteView',
    disableSelection: true,
    itemSelector: '.theme-swatch',
    cls: 'taco-theme-selector',
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
        this.listeners = {
            itemclick: function(view, model, element, idx, eventObj) {
                var targetEl = Ext.get(eventObj.target),
                    width, height, id;

                eventObj.preventDefault();
                /*

                This came from themes

                if (targetEl.hasCls('action-settings')) {
                    Ext.defer(function() {
                        Taco.core.StateManager.attemptNavigate('themesettings/edit/' + model.getId(), {
                            complexMetaData: {
                                record: model
                            }
                        });
                    }, 1, this);
                    return;
                    
                }
                */
            },

            scope: this
        };

        this.callParent(arguments);
    },
});