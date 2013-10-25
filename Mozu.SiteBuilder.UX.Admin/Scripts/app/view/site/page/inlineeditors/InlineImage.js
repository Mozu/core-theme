/**
 * @class Taco.view.site.page.inlineeditors.InlineImage
 */
Ext.define('Taco.view.site.page.inlineeditors.InlineImage', {
    extend: 'Taco.view.fileManager.Associator',

    autoShow: true,
    allowMultiple: false,
    originalValue: null,
    isModal: true,
    setDimensions:true,
    initComponent: function () {
        var me = this,
        parts;
        parts = me.editableElement.getAttribute('src').split('/');
        me.initialSelected = [
            {
                id: parts[parts.length - 1], alt: me.editableElement.getAttribute('alt')
            }
        ];


        me.callParent(arguments);
        me.on('save', me.onSave, me);

    },
    onSave: function () {
        var me = this,
            args,
            img,
            fmf;
        if (me.getSelectedRecords().count() === 0) {
            return;
        }
        fmf = me.getSelectedRecords().getAt(0);
        args = {
            src: '/files/' + Taco.app.context.getTenantId() + '/' + Taco.app.context.getMasterCatalogId() + '/' +  fmf.getId(),
            alt: fmf.get('alt'),
            height: fmf.get('height'),
            width: fmf.get('width')
        };
        args.imagePath = args.src;
        args.url = args.src;



        me.editableElement.dom.setAttribute('src', args.src);
        if ( me.setDimensions){
            me.editableElement.dom.setAttribute('height', args.height);
            me.editableElement.dom.setAttribute('width', args.width);
        }
        me.fireEvent('complete', args, me.metaData, me);
        me.hide();
    },
    beforeCompleteEdit: function () { return true; },
    attemptCompleteEdit: function () { return true; }

  
});
   