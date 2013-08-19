Ext.define('Overrides.panel.Tool', {
    override: 'Ext.panel.Tool',

    height: 16,

    width: 16,

    renderTpl: ['<span role="presentation" id="{id}-toolEl" src="{blank}" class="{baseCls}-img {baseCls}-{type}' + '{childElCls}" role="presentation"></span>']
});
