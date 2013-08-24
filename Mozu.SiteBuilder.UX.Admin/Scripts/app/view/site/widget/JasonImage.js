/**
 * @class Taco.view.site.widget.JasonImage
 */
Ext.define('Taco.view.site.widget.JasonImage', {
    extend: 'Taco.view.fileManager.Associator',

    autoShow: true,
    allowMultiple: false,
    originalValue: null,
    isModal: true,
    initComponent: function () {

        var me = this,
            parts,
            data = me.widgetEditData.document.getItem('image_url', true);
        if ( data != null ){
            parts = data.src.split('/');
            me.initialSelected=[
                {
                    id: parts[parts.length - 1], alt: data.alt
                }
            ];
        }
      
       this.callParent(arguments);

        me.on('save', me.onSave, me);
        

    }
    ,
    onSave: function () {
        var me = this,
            args,
            img,
            fmf;
        if (me.getSelectedRecords().count() == 0) {
            return;
        }
        fmf = me.getSelectedRecords().getAt(0);
        args = {
            src: '/files/' + Taco.app.context.getTenantId() + '/' + Taco.app.context.getSiteGroupId() + '/' + fmf.getId(),
            alt: fmf.get('alt'),
            height: fmf.get('height'),
            width: fmf.get('width')
        };


        me.widgetEditData.document.setItem('image_url', args, true);
        me.fireEvent('aftersave', me);
        me.hide();

    }



});
