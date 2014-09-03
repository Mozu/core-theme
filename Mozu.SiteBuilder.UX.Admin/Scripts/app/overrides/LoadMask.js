// Setting useMsg to false.

Ext.define('Taco.overrides.LoadMask', {
    override: 'Ext.LoadMask',
    
    useMsg: false,
    maskCls: 'x-mask taco-loadmask'
});