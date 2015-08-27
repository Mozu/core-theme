Ext.define('Taco.overrides.menu.Item', {
    override: 'Ext.menu.Item',
    renderTpl: [
        '<tpl if="plain">',
            '{text}',
        '<tpl else>',
            '<a id="{id}-itemEl"',
                ' class="{linkCls} {indentCls}{childElCls}"',
                ' href="{href}" role="presentation" ',
                '<tpl if="hrefTarget"> target="{hrefTarget}"</tpl>',
                ' hidefocus="true"',
                // For most browsers the text is already unselectable but Opera needs an explicit unselectable="on".
                ' unselectable="on"',
                '<tpl if="tabIndex">',
                    ' tabIndex="{tabIndex}"',
                '</tpl>',
            '>',
                '<span id="{id}-textEl" class="{textCls}{childElCls}" unselectable="on">{text}</span>',
                '<tpl if="hasIcon">',
                    '<div role="presentation" id="{id}-iconEl" class="{baseIconCls}',
                        '{[values.rightIcon ? "-right" : ""]} {iconCls}',
                        '{childElCls} {glyphCls}" style="<tpl if="icon">background-image:url({icon});</tpl>',
                        '<tpl if="glyph && glyphFontFamily">font-family:{glyphFontFamily};</tpl>">',
                        '<tpl if="glyph">&#{glyph};</tpl>',
                    '</div>',
                '</tpl>',
                '<tpl if="showCheckbox">',
                    '<div role="presentation" id="{id}-checkEl" class="{baseIconCls}',
                        '{[(values.hasIcon && !values.rightIcon) ? "-right" : ""]} ',
                        '{groupCls} {checkboxCls}{childElCls}">',
                    '</div>',
                '</tpl>',
                '<tpl if="accelerator">',
                    '<div role="presentation" id="{id}-acceleratorEl" class="{acceleratorCls}{childElCls}">{accelerator}</div>',
                '</tpl>',
                '<tpl if="hasMenu">',
                    '<div role="presentation" id="{id}-arrowEl" class="{arrowCls}{childElCls}"></div>',
                '</tpl>',
            '</a>',
        '</tpl>'
    ],
    beforeRender: function () {
        var me = this,
            // Note: pdm has determined that 10% of gmail users don't use keyboard shortcuts.
            // So we will not show the keyboard shortcuts in the menus in our application. 
            // Power users will have to accidently stumble onto these features or be omnipotent. 
            // If they are in fact omnipotent, I will be greatly disappointed that they are wasting their time managing an ecommerce site.
            // If your ever curious when and why I finally flipped the bit, look no more.
            pdmClueless = true;

        this.callParent(arguments);
        Ext.applyIf(me.renderData, {
            acceleratorCls: me.acceleratorCls,
            accelerator: me.accelerator && !pdmClueless
        });
    },
    acceleratorCls: Ext.baseCSSPrefix + 'menu-item-accelerator'
});
