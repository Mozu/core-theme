/**
 * @class Taco.view.site.page.hint.Element
 * Hint for inline editing of editable elements 
 */
Ext.define('Taco.view.site.page.hint.Element', {
    extend: 'Taco.view.site.page.hint.Hint',
    type: 'element',
    hintCls: 'taco-hint-element',
    
    initComponent: function () {
        
        this.callParent(arguments);
        
        this.on({
            click: {
                fn: function (e) {
                    e.stopEvent();
                    this.shim.fireEvent('begineditelement', this, this.associatedEl);
                },
                scope: this,
                element: 'el'
            },
            mouseenter: {
                fn: this.activate,
                scope: this,
                element: 'el'
            },
            mouseleave: {
                fn: this.deactivate,
                scope: this,
                element: 'el'
            }
        })
    }
});
