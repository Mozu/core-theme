/**
 * @class Taco.core.ux.MultiImageField
 */

    Ext.define('Taco.core.ux.MultiImageField', {
        extend: 'Ext.container.Container',
        alias: 'widget.multiimagefield',
        border: true,
        entityId: null,
        tpl: ['<div class="taco-tileview tilesize-230px">',
                '<div class="taco-thumbnail-item">',
                    '<div class="featured-container">',
                        '<div class="container">',
                            '<img src="{src}?size=230" />',
                        '</div>',
                        '<tpl if="total &gt; 0">',
                            '<div class="taco-arrow taco-previous"></div>',
                            '<div class="taco-arrow taco-next"></div>',
                            '<div class="taco-count">{index} of {total}</div>',
                        '</tpl>',
                    '</div>',
                '</div>',
            '</div>'],
        header: '',
        mixins: {
            field: 'Ext.form.field.Field'
        },
        curIdx: 0,
        data: { src: '/admin/Scripts/resources/images/legacy/AddPhotos.png', index: 0, total: 0}, 
        setValue: function (value) {
            var me = this;

            if (value && value.length > 0) {
                this.update({ src: value[me.curIdx].imagePath, index: me.curIdx + 1, total: value.length });
            }

            return me.mixins.field.setValue.call(me, value);
        },
        isEqual: function (value1, value2) {
            if (value1 == null && value2 == null) {
                return true;
            }
            if (value1 == null || value2 == null) {
                return false;
            }
            if (value1.length !== value2.length) {
                return false;
            }

            if (value1.length === 0) {
                return true;
            }
            return Ext.encode(value1) == Ext.encode(value2);

        },
        initComponent: function () {
            var me = this;

            me.callParent(arguments);
            me.on({
                click: {
                    element: 'el',
                    fn: function (e, t, options) {
                        var d = Ext.get(t),
                            images = me.mixins.field.getValue.call(me);
                        if (d.hasCls('taco-next')) {
                            me.curIdx++;
                            if (me.curIdx >= images.length) {
                                me.curIdx = 0;
                            }
                            me.update({ src: images[me.curIdx].imagePath, index: me.curIdx+1, total: images.length });
                        }
                        else if (d.hasCls('taco-previous')) {
                            me.curIdx--;
                            if (me.curIdx < 0) {
                                me.curIdx = images.length - 1;
                            }
                            me.update({ src: images[me.curIdx].imagePath, index: me.curIdx + 1, total: images.length });
                        }
                        else if (d.hasCls('taco-container') || d.dom.nodeName=="IMG") {
                            me.fireEvent('click', me, t, options);
                        }

                    }
                }
            });

        }




    });