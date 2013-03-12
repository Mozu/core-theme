/**
 * @class Taco.view.theme.ThemeView
 * @author Michael Speed Elder
 * Date: 12/4/12
 * Time: 6:21 PM
 *
 *
 */

Ext.define('Taco.view.theme.ThemeView', {
    extend: 'Ext.view.View',
    xtype: 'themeview',
    store: this.store,
    disableSelection: true,
    padding: '0 0 12 0', // *** Make room for box-shadow
    // renderSelected: false, // *** Override through config when newing up to render either the "published" or the "unpublished" theme.
    itemSelector: 'div.taco-theme-swatch'

    , initComponent: function () {
        this.tpl = new Ext.XTemplate(
            '<tpl for=".">',
            // this.renderSelected ? '<tpl if="selected">' : '<tpl if="!selected">',
                '{% this.getPlatform(values); %}',
                '<div class="taco-theme-swatch {[ values.isSelectedDesktop || values.isSelectedMobile ? "x-item-selected" : "" ]}" style="background-image: url({thumbnail})" data-selected="{selected}" data-platform="{platformCls}">',
                    '<div class="taco-inner-theme-wrapper">',
                        '<div class="taco-swatch-label taco-current-theme"><span>Current Theme</span></div>',
                        '<div class="taco-swatch-label taco-set-as-theme">',
                            '<span>Set as Theme</span>',
                            '<br>',
                            '<a href="javascript:;" class="preview">Preview</a>',
                        '</div>',
                        '<div class="taco-theme-title">{name}</div>',
                    '</div>',
                    '<div class="taco-theme-platform">',
                        '{[ values.platform ]}',
                        '<span class="taco-deselect-theme">&times;</span> ',
                    '</div>',
                '</div>',
            // '</tpl>',
            '</tpl>',
            {
                disableFormats: true,
                getPlatform: function ( values ) {
                    if( values.isMobile ) {
                        if( values.isDesktop ) {
                            values.platform = 'Desktop + Mobile';
                            values.platformCls = 'both';
                        } else {
                            values.platform = 'Mobile';
                            values.platformCls = 'mobile';
                        }
                    } else {
                        values.platform = 'Desktop';
                        values.platformCls = 'desktop';
                    }
                }
            }
        );

        this.listeners = {
            itemmouseenter: function (view, model, element) {
                element = element.childNodes[0];
                Ext.fly( element ).setOpacity(1, true);
            },

            itemmouseleave: function (view, model, element, index) {
                element = element.childNodes[0];
                Ext.fly( element ).setOpacity(0.66, true);
            },

            itemclick: function (view, model, element, idx, eventObj) {
                var targetFly = Ext.fly(eventObj.target),
                    width, height;

                // *** Deselect the theme
                if( targetFly.hasCls(Taco.baseCSSPrefix + 'deselect-theme') ) {
                    model.set({
                        "isSelectedDesktop": false,
                        "isSelectedMobile": false
                    });
                    this.store.sync();
                }

                // *** Preview the theme
                else if( targetFly.hasCls('preview') ) {
                    height = Taco.app.viewPort.getHeight();
                    width = Taco.app.viewPort.getWidth();

                    Ext.util.Cookies.set('SBTHEME', model.getId());

                    Ext.create('Ext.window.Window', {
                        title:  model.getId() + ' Theme Preview',
                        height: height - 20,
                        width: width - 20,
                        layout: 'fit',
                        listeners: {
                            close: function (panel) {
                                Ext.util.Cookies.clear('SBTHEME');
                            }
                        },
                        items: {  // Let's put an empty grid in just to illustrate fit layout
                            html: '<iframe src="/" width=' + (width - 30) + ' height=' + (height - 30) + ' />'
                        }
                    }).show();
                }

                // *** Attempt to select the theme
                else if (!model.get('isSelectedDesktop') || !model.get('isSelectedMobile')) {
                    // you may delete the below as soon as you have found it :)  // *** Hugs 4 Zetlen
                    // var a = document.createElement("audio");
                    // document.body.appendChild(a);
                    // a.src = "/admin/scripts/resources/images/indicator.mp3";
                    // a.load();
                    // a.play();

                    if ( model.get("isDesktop") ) {
                        this.swapSelection("isSelectedDesktop", model);
                    }

                    if ( model.get("isMobile") ) {
                        this.swapSelection("isSelectedMobile", model);
                    }

                    this.store.sync();
                }
            },

            scope: this
        };

        this.callParent( arguments );
    },

    /**
     * Attempts to deselect any selected record that is the same type as the record just clicked on,
     * and then sets the new record to selected.
     * @param {String} fieldName
     * @param {Ext.data.Model} model
     */
    swapSelection: function ( fieldName, model ) {
        // *** Grab the currently selected record (with matching fieldName) and set to false
        var selectedModel = this.store.findRecord(fieldName, true);
        if( selectedModel )
            selectedModel.set(fieldName, false);
        model.set(fieldName, true);
    }
});