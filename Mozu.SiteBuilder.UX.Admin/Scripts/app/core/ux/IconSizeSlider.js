/**
 * @class Taco.core.ux.IconSizeSlider
 */
Ext.define('Taco.core.ux.IconSizeSlider', {
    extend: 'Ext.container.Container',
    requires: ['Ext.Slider'],
    alias: 'widget.iconsizeslider',
    layout: 'hbox',

    items: [{
        xtype: 'tbtext',
        text: '&nbsp;',
        cls: 'taco-slider-icon-small',
        width: 20,
        height: 20
    }, {
        xtype: 'slider',
        width: 100,
        value: 120,
        increment: 40,
        minValue: 80,
        maxValue: 160,
        listeners: {
            change: function (slider) {
                var newCls = 'taco-datalist-size-' + slider.thumbs[0].value + 'px';
                slider.view.removeCls(['taco-datalist-size-80px', 'taco-datalist-size-120px', 'taco-datalist-size-160px']);
                slider.view.addCls(newCls);
            }
        }
    }, {
        xtype: 'tbtext',
        text: '&nbsp;',
        width: 20,
        height: 20,
        cls: 'taco-slider-icon-big'
    }],

    initComponent: function () {
        this.items[1].view = this.view;
        this.callParent(arguments);
    }

});