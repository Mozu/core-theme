/**
 * @class Taco.core.ux.action.UserButton
 */

Ext.define('Taco.core.ux.action.UserButton', {
    extend: 'Ext.button.Button',
    alias: 'widget.userbutton',
    baseCls: Taco.baseCSSPrefix + 'userbutton',
    componentLayout: 'autocomponent',
    renderTpl: [
        '<div id="{id}-userbutton" data-delay="0" class="{baseCls}-wrapper">',
            '<div id="{id}-userbutton-dropdown-toggle" class="{baseCls}-dropdown-toggle">',
                '<div id="{id}-userbutton-avatar" class="{baseCls}-user-avatar">{initials}</div>',
                '<div id="{id}-userbutton-username" class="{baseCls}-username">{userName}</div>',
            '</div>',
        '</div>'
    ],
    childEls: ['userbutton'],

    initRenderData: function() {
        var data = this.callParent();
        data.initials = this.initials;
        data.userName = this.userName;
        return data;
    }
});