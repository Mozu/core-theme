Ext.define('Taco.core.PageView', {

    extend: 'Ext.container.Container',

    autoEl: 'article',
    baseCls: 'taco-main',
    
    autoScroll: true,
    
    layout: {
        type: 'vbox',
        align: 'stretch'
    }
    
    
});