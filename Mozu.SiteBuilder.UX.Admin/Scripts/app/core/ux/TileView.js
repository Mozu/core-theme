/**
 * @class Taco.core.ux.TileView
 */
Ext.define('Taco.core.ux.TileView', {
    extend: 'Ext.view.View',
    alias: 'widget.tileview',
    cls: Taco.baseCSSPrefix + 'tileview',

    actions: [],
    bubbleEvents: ['select', 'deselect', 'add', 'remove'],
    featured: false,
    imageCollection: false,
    imageField: 'thumbnail',
    nameField: 'name',
    tileSizes: [90, 160, 230],
    itemSelector: 'div.taco-thumbnail-item',

    initComponent: function () {
        var me = this,
        thumbNailItemCls = this.isDragable ? 'draggable' : '',
        tileSizeMax = Ext.Array.max(me.tileSizes) || 230,
        nameTpl = '<div class="name">{' + me.nameField + '}</div>',
        actionsTpl = '',
        featuredTpl = '',
        imageTpl = '';

        Ext.Array.each(me.actions, function (action) {
            actionsTpl += ('<div class="action ' + action.iconCls + '" data-qtip="' + action.tooltip + '"></div>');
        });

        if (me.featured) {
            featuredTpl = '<div class="featured">featured</div>';
            nameTpl = '';
        }

        if (me.imageCollection) {
            imageTpl = '<tpl for="' + me.imageCollection + '"><img src="{' + me.imageField + '}?size=' + tileSizeMax + '" />{% if (xindex > 0) break; %}</tpl>';
        } else {
            imageTpl = '<img src="{' + me.imageField + '}?size=' + tileSizeMax + '" />';
        }

        me.tpl = ['<tpl for=".">',
            '<div class="taco-thumbnail-item' + ' ' + thumbNailItemCls +'">',
                '<div class="featured-container">',
                    '<div class="container">',
                        featuredTpl,
                        '<tpl if="localthumbnail">',
                            '<img src="{localthumbnail}" />',
                        '<tpl else>',
                            imageTpl,
                        '</tpl>',
                    '</div>',
                    nameTpl,
                    '<div class="actions">',
                        actionsTpl,
                    '</div>',
                '</div>',
            '</div>',
        '</tpl>'];

        this.callParent(arguments);

        me.on('render', function () {
            var me = this,
            tileSizeMax = Ext.Array.max(me.tileSizes) || 230;

            me.changeTileSize(tileSizeMax);
        });
    },

    changeTileSize: function (newSize) {
        var me = this;

        Ext.Array.each(me.tileSizes, function (size) {
            me.removeCls('tilesize-' + size + 'px');
        });
        me.addCls('tilesize-' + newSize + 'px');
    }
});