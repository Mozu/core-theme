Ext.define('Taco.overrides.picker.Month', {
    override: 'Ext.picker.Month',
    initComponent: function () {        
        var me = this;

        this.callParent();
        if (me.showButtons) {
            // new code
            me.initButtons()
        }        
    },


    renderTpl: [
        '<div id="{id}-bodyEl" class="{baseCls}-body">',
          '<div id="{id}-monthEl" class="{baseCls}-months">',
              '<tpl for="months">',
                  '<div class="{parent.baseCls}-item {parent.baseCls}-month">',
                      // the href attribute is required for the :hover selector to work in IE6/7/quirks
                      '<a style="{parent.monthStyle}" hidefocus="on" class="{parent.baseCls}-item-inner" href="#">{.}</a>',
                  '</div>',
              '</tpl>',
          '</div>',
          '<div id="{id}-yearEl" class="{baseCls}-years">',
              '<div class="{baseCls}-yearnav">',
                  '<div class="{baseCls}-yearnav-button-ct">',
                      // the href attribute is required for the :hover selector to work in IE6/7/quirks
                      '<a id="{id}-prevEl" class="{baseCls}-yearnav-button {baseCls}-yearnav-prev" href="#" hidefocus="on" ></a>',
                  '</div>',
                  '<div class="{baseCls}-yearnav-button-ct">',
                      // the href attribute is required for the :hover selector to work in IE6/7/quirks
                      '<a id="{id}-nextEl" class="{baseCls}-yearnav-button {baseCls}-yearnav-next" href="#" hidefocus="on" ></a>',
                  '</div>',
              '</div>',
              '<tpl for="years">',
                  '<div class="{parent.baseCls}-item {parent.baseCls}-year">',
                      // the href attribute is required for the :hover selector to work in IE6/7/quirks
                      '<a hidefocus="on" class="{parent.baseCls}-item-inner" href="#">{.}</a>',
                  '</div>',
              '</tpl>',
          '</div>',
          '<div class="' + Ext.baseCSSPrefix + 'clear"></div>',
        '</div>',
        '<tpl if="showButtons">',
            '<div id="{id}-buttonsEl" class="{baseCls}-buttons" style="text-align:right;">{%',
                'var me=values.$comp, okBtn=me.okBtn, cancelBtn=me.cancelBtn;',
                'okBtn.ownerLayout = cancelBtn.ownerLayout = me.componentLayout;',
                'okBtn.ownerCt = cancelBtn.ownerCt = me;',
                // override: reverse the order of the buttons so that they are like the rest of our app.
                'Ext.DomHelper.generateMarkup(cancelBtn.getRenderTree(), out);',
                'Ext.DomHelper.generateMarkup(okBtn.getRenderTree(), out);',
            '%}</div>',
        '</tpl>'
    ],

    initButtons: function () {
        var me = this;        
        // remove the buttons originally part of this class;
        me.okBtn.destroy();
        me.cancelBtn.destroy();

        // add in the taco flavored buttons
        me.okBtn = new Ext.button.Button({
            ui: "action-primary",
            scale: "medium",
            margin: "0px 4px 0px 2px",
            text: me.okText,
            handler: me.onOkClick,
            scope: me
        });

        me.cancelBtn = new Ext.button.Button({
            text: me.cancelText,
            ui: "action",
            scale: "medium",
            handler: me.onCancelClick,
            scope: me
        });


        

    }

});
