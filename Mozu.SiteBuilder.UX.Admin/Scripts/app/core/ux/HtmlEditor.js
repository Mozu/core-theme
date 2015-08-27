/**
* @class Taco.core.ux.HtmlEditor
* @author James Zetlen
* Supermodified Ext.HtmlEditor for use in EditSurface
* ??ORPHAN??
*/

Ext.define('Taco.core.ux.HtmlEditor', {
    extend: 'Ext.form.field.HtmlEditor',
    alias: ['widget.tacohtmleditor',
        'widget.taco-htmleditor',
    ],
    requires:[
        'Taco.core.ux.HtmlEditorImagePlugin'
    ],
    mixins: ['Taco.core.util.GetsTextFormat'],
    plugins: [
         Ext.create('Taco.core.ux.HtmlEditorImagePlugin')
    ],
    cls: Taco.baseCSSPrefix + 'wysiwyg',

 

    fontFamilies: [
        'Helvetica',
        'Arial',
        'Courier New',
        'Times New Roman',
        'Verdana'
    ],

    //enableSourceEdit: false,

    /**
    * Disallowed tags are replaced with span tags, or removed if that would result in bad DOM.
    */
    disallowedTags: ['div'],


    stripDisallowedTags: function (value) {
        /*
        * Begin DOM parsing. Compile HTML into a element, so we can use DOM methods to strip block-level elements.
        *
        */
        if (this.disallowedTags.length > 0) {
            var numTagsPresent = 0,
                    stagingDiv = Ext.DomHelper.createDom({
                        tag: 'div',
                        html: value
                    });

            Ext.Array.each(this.disallowedTags, function (tagname) {
                Ext.Array.each(Ext.DomQuery.select(tagname, stagingDiv), function (elm) {
                    numTagsPresent++;
                    try {
                        var df = document.createDocumentFragment(),
                            len = elm.childNodes.length;
                        for (var i = 0; i < len; i++) {
                            df.appendChild(elm.childNodes[i].cloneNode(true));
                        }

                        elm.parentNode.insertBefore(df, elm);
                    } catch (badDom) { }
                    elm.parentNode.removeChild(elm);
                });
            });

            // we check to see if we made any changes because whether we did or not, innerHTML won't be precisely the same string as the original value
            // and if we made no changes, we want the original value to work in an equality test.
            if (numTagsPresent > 0) {
                value = stagingDiv.innerHTML;
            }
        }

        return value;
    }


});

