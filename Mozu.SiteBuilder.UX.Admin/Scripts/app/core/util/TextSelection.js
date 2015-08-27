/** 
 * @class Taco.core.util.TextSelection
 * Mixin that abstracts browser-specific caret position/text selection methods.
 *
 */
Ext.define('Taco.core.util.TextSelection', {

    /**
     * Tests for a string currently highlighted by the user in any part of the document.
     * @param {String} theString The string to test for.
     * @return {Boolean}
     */
    isStringHighlighted: function (theString) {
        if (Ext.isGecko || Ext.isOpera || Ext.isChrome) {
            if (window.getSelection().toString().indexOf(theString) >= 0)
                return true;
        }
        else if (Ext.isIE) {
            var ieSelection,
                ieSelectionRange;

            if ((ieSelection = document.selection) && (ieSelectionRange = ieSelection.createRange()) && (ieSelectionRange.text.indexOf(theString) >= 0))
                return true;
        }

        return false;
    },

    /**
     * Tests for any text currently highlighted by the user. On supported browsers (non-IE), highlight selection is tested for the given element.
     * @param {HTMLInputElement} element The input element to test (non-IE support only)
     * @return {Boolean} 
     */
    isAnyTextHighlighted: function (element) {
        return (this.getHighlightedText(element).length > 0);
    },

    /**
     * Tests for caret position AFTER a string. On supported browsers (non-IE), caret position is specific  to the given element.
     * @param {HTMLInputElement} element The input element to test. (partial IE support)
     * @param {String} theString The string to test for.
     * @param {Boolean} testAfterFullString Whether to test that the carat is after the last character of the string.
     * @return {Boolean}
     */
    isCaretAfter: function (element, theString, testAfterFullString) {
        var currentCharPos,
            stringStartPosition = element.value.indexOf(theString),
            stringEndPosition = stringStartPosition + theString.length;

        // return false if the search string doesn't actually exist in the value.
        if (stringStartPosition < 0)
            return false;

        if (Ext.isGecko || Ext.isOpera || Ext.isChrome) {
            if (element.selectionStart != null) {
                currentCharPos = element.selectionStart;

                if ((testAfterFullString && currentCharPos >= stringEndPosition) || (!testAfterFullString && currentCharPos > stringStartPosition))
                return true;
            }
        }
        else if (Ext.isIE) {
            var ieSelection,
                ieSelectionRange;

            if ((ieSelection = document.selection) && (ieSelectionRange = ieSelection.createRange())) {
                // determine if we are after the search string by "highlighting" backwards.
                ieSelectionRange.moveStart("character", -(element.value.length));

                currentCharPos = ieSelectionRange.text.length;
                
                if ((testAfterFullString && currentCharPos >= stringEndPosition) || (!testAfterFullString && currentCharPos > stringStartPosition))
                    return true;
                }
            }

        return false;
    },

    /**
     * Gets the user-highlighted text for an input element.
     * @param {HTMLInputElement} element The input element to test. (no IE support - IE will test whole document)
     * @return {String}
     */
    getHighlightedText: function(element) {
        if (Ext.isGecko || Ext.isOpera || Ext.isChrome) {
            if ((element.selectionStart && element.selectionEnd) && (element.selectionEnd > element.selectionStart) && element.value) {

                // some text is highlighted.
                var selectedText = element.value.substr(element.selectionStart, element.selectionEnd - element.selectionStart);
                
                return selectedText;
            }
        }
        else if (Ext.isIE) {
            var ieSelection,
                ieSelectionRange;

            if ((ieSelection = document.selection) && (ieSelectionRange = ieSelection.createRange())) {
                if (!Ext.isEmpty(ieSelectionRange.text)) {
                    // some text is highlighted.
                    return ieSelectionRange.text;
                }
            }
        }

        return "";
    }

});