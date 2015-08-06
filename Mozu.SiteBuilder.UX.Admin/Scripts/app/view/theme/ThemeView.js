/**
 * @class Taco.view.theme.ThemeView
 * @author Michael Speed Elder
 * Date: 12/4/12
 * Time: 6:21 PM
 *
 *
 */

Ext.define('Taco.view.theme.ThemeView', {
    extend: 'Taco.core.ux.GroupedView',
    xtype: 'widget.taco.themeview',
    disableSelection: true,
    itemSelector: '.theme-swatch',
    cls: 'taco-theme-selector',
    requires: [
        'Ext.ux.IFrame'
    ],
    tpl: [
        '<tpl for="groups">',
            '<h2>',
                'Applied Themes',
            '</h2>',

            '<ul style="margin-top: 13px" class="group group-<tpl if="name == true">applied<tpl else>purchased</tpl>">',
                '<tpl for="children">',
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
                                '<tpl if="values.data.isMobile">',
                                    '<div class="icon icon-mobile <tpl if="!values.data.isSelectedMobile">inactive</tpl>"></div>',
                                    '<div class="text <tpl if="!values.data.isSelectedMobile">inactive</tpl>">Mobile</div>',
                                '</tpl>',
                                '<tpl if="values.data.isTablet">',
                                    '<div class="icon icon-tablet <tpl if="!values.data.isSelectedTablet">inactive</tpl>"></div>',
                                    '<div class="text <tpl if="!values.data.isSelectedTablet">inactive</tpl>">Tablet</div>',
                                '</tpl>',
                            '</li>',
                            '<li class="actions">',
                                '<a class="action-preview" href="#">Preview</a>',
                                '<a class="action-settings" href="#">Settings</a>',
                              /*  '<a class="action-addons" href="#">Addons</a>'      ,*/
                                '<tpl if="!values.data.isSelected">',
                                    '<a class="action-apply" href="#">Apply</a>',
                                '<tpl else>',
                                    '<a class="action-remove" href="#">Remove</a>',
                                '</tpl>',
                            '</li>',
                        '</ul>',
                        '<div class="title">{[values.data.name]}</div>',
                        '<img class="thumbnail" src="{[values.data.thumbnail]}">',
                    '</li>',
                '</tpl>',
            '</ul>',
        '</tpl>'
    ],

    initComponent: function () {
        this.listeners = {
            itemclick: function (view, model, element, idx, eventObj) {
                var targetEl = Ext.get(eventObj.target),
                    width,
                    height;


                eventObj.preventDefault();


                if (targetEl.hasCls('action-preview')) {
                    height = Taco.app.viewPort.getHeight();
                    width = Taco.app.viewPort.getWidth();


                    Ext.create('Ext.window.Window', {
                        title: model.getId() + ' Theme Preview',
                        height: height - 20,
                        width: width - 20,
                        layout: 'fit',

                        items: [
                            {
                                flex: 1,
                                itemId: 'iframe',
                                xtype: 'uxiframe',
                                src: '/_gosite/' + Taco.app.context.getSiteId() + '?environment=editing&redir=' + encodeURIComponent(Ext.String.urlAppend('/', '/?iseditmode=true&SBTHEME=' + model.getId())),
                                listeners: {
                                    load: function (iframe) {
                                        Ext.EventManager.on(iframe.getDoc(), 'click', function (e, target) {
                                            var url = target.pathname + target.search;
                                            if (target.hostname === iframe.getWin().location.hostname && !e.browserEvent.defaultPrevented) {


                                                iframe.getWin().location.href = Ext.String.urlAppend(url, 'SBTHEME=' + model.getId());

                                                e.stopEvent();
                                            }
                                        }, this, {
                                            delegate: 'a'
                                        });
                                    }
                                }
                            }
                        ]

                    }).show();
                }

                if (targetEl.hasCls('action-settings')) {
                    Ext.defer(function () {
                        Taco.core.StateManager.attemptNavigate('themesettings/edit/' + model.getId(), {
                            complexMetaData: {
                                record: model
                            }
                        });
                    }, 1, this);
                    return;

                }
                if (targetEl.hasCls('action-addons')) {
                    Ext.defer(function () {
                        Taco.core.StateManager.attemptNavigate('themesettings/addons/' + model.getId(), {
                            complexMetaData: {
                                record: model
                            }
                        });
                    }, 1, this);
                    return;

                }

                if (targetEl.hasCls('action-apply')) {
                    if (model.get('isDesktop')) {
                        this.swapSelection('isSelectedDesktop', model);
                    }

                    if (model.get('isMobile')) {
                        this.swapSelection('isSelectedMobile', model);
                    }

                    if (model.get('isTablet')) {
                        this.swapSelection('isSelectedTablet', model);
                    }

                    this.store.sync();
                }

                if (targetEl.hasCls('action-remove')) {
                    // if (model.get('isDesktop')) {
                    this.removeSelection.call(this, model);
                    // }

                    // if (model.get('isMobile')) {
                    //     this.removeSelection('isSelectedMobile', model);
                    // }

                    // if (model.get('isTablet')) {
                    //     this.removeSelection('isSelectedTablet', model);
                    // }

                    // this.removeSelection('isSelected', model);

                    // this.store.sync();
                }

            },

            scope: this
        };

        this.callParent(arguments);
    },

    /**
     * Attempts to deselect any selected record that is the same type as the record just clicked on,
     * and then sets the new record to selected.
     * @param {String} fieldName
     * @param {Ext.data.Model} model
     */
    swapSelection: function (fieldName, model) {
        this.removeSelection(fieldName);
        model.set(fieldName, true);
    },
    removeSelection: function (model) {
        
        var me = this,
            theme = Ext.create('Taco.model.ThemeListing', {
                id: model.getId(),
                isSelectedDesktop: model.get('isSelectedDesktop'),
                isSelectedMobile: model.get('isSelectedMobile'),
                isSelectedTablet: model.get('isSelectedTablet')
            });

        theme.applyTheme({
            success: function() {
                me.store.reload();
                me.up('#taco-themeView').treeStore.reload();
            },
            apply: false
        });

    }
});