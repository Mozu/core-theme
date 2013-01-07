/**
 * @class Taco.view.site.page.inlineeditors.InlineImage
 */
Ext.define('Taco.view.site.page.inlineeditors.InlineImage', {
    extend: 'Taco.view.fileManagement.MultiFileAssociator',

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
            src: '/admin/img/files/' + fmf.getId(),
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

    //    editableElement: editableElement,
    //                        metaData: metaData,

    //    <img data-editing-element="{&quot;documentId&quot;:&quot;4fdfa18b77b3c723d47148c3&quot;,&quot;collection&quot;:&quot;widgets&quot;,&quot;fieldName&quot;:&quot;image_url&quot;,&quot;isShadow&quot;:false,&quot;entityType&quot;:&quot;cms&quot;,&quot;fieldType&quot;:&quot;image&quot;,&quot;editDefault&quot;:&quot;{ \&quot;src\&quot;:\&quot;\/admin\/scripts\/resources\/images\/AddPhotos.png\&quot;, \&quot;alt\&quot;:\&quot;food is good\&quot; }&quot;,&quot;definitionId&quot;:&quot;image&quot;,&quot;sequence&quot;:0}" src="/admin/img/files/4fda4d5e77b3c7167467eff7" alt="" width="528" height="396">

});
   