/** 
 * @class Taco.util.Validation
 * common validation methods
 * */
Ext.define('Taco.core.util.Validation', {
    singleton: true,

    constructor: function(config) {
        this.initConfig(config);
    },
    config: {
        seoFriendlyRegex: new RegExp(/^[a-z0-9-_\.()]*[a-z0-9-_()]$/i),  //not il18n friendly
        queryStringRegex: new RegExp(/^[^%*&+:<>?\\/]*[^%*&+:<>?\\/\.]$/)   
    },

    /*  a utility method to store recurring regex and other validation functions.
     * example:
     * 
     {
       xtype: "textfield",
       name: "code",
       allowOnlyWhitespace: false,
       maxLength: 10,
       validator: Taco.core.util.Validation.validateSeoFriendlyText
     }
     * 
     * 
    */

    /**
     * Validates text is SEO friendly.  Allows empty.
     * @param value text value
     * @returns if passes validation then returns true, else returns error string
     */
    validateSeoFriendlyText : function(value) {
        var seoFriendlyRegex = Taco.core.util.Validation.getSeoFriendlyRegex(),
            isValid = !value || seoFriendlyRegex.test(value);
        if (!isValid) {
            return 'Invalid format: no spaces or special characters are allowed except hyphens, underscores, parentheses, and periods, but may not end with a period.';
        }
        return true;
    },
    
    /**
     * Validates queryString text is URL friendly.  Allows empty.
     * @param value text value
     * @returns if passes validation then returns true, else returns error string
     */
    validateQueryString : function(value) {
        var queryStringRegex = Taco.core.util.Validation.getQueryStringRegex(),
            isValid = !value || queryStringRegex.test(value),
            validationMsg;
        if (!isValid) {
            validationMsg = 'Invalid format: please remove any of these special characters % * & + : < > ? / \\';
            if (value.endsWith('.')) {
                validationMsg += '  Periods are not allowed at the end.';
            }
            return validationMsg;
        }
        return true;
    }

});