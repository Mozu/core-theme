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

        seoFriendlyRegex: new RegExp(/^[a-z0-9-_\.()]*[a-z0-9-_()]$/i), //not il18n friendly
        //  NODE                     EXPLANATION
        //--------------------------------------------------------------------------------
        //  ^                        the beginning of the string
        //--------------------------------------------------------------------------------
        //  [a-z0-9-_\.()]*          any character of: 'a' to 'z', '0' to '9',
        //                           '-', '_', '\.', '(', ')' (0 or more times
        //                           (matching the most amount possible))
        //--------------------------------------------------------------------------------
        //  [a-z0-9-_()]             any character of: 'a' to 'z', '0' to '9',
        //                           '-', '_', '(', ')'
        //--------------------------------------------------------------------------------
        //  $                        before an optional \n, and the end of the
        //                           string


        queryStringRegex: new RegExp(/^[^%*&+:<>?\\/]*[^%*&+:<>?\\/\.]$/),
        //  NODE                     EXPLANATION
        //--------------------------------------------------------------------------------
        //  ^                        the beginning of the string
        //--------------------------------------------------------------------------------
        //  [^%*&+:<>?\\/]*          any character except: '%', '*', '&', '+',
        //                           ':', '<', '>', '?', '\\', '/' (0 or more
        //                           times (matching the most amount possible))
        //--------------------------------------------------------------------------------
        //[^%*&+:<>?\\/\.]           any character except: '%', '*', '&', '+',
        //                           ':', '<', '>', '?', '\\', '/', '\.'
        //--------------------------------------------------------------------------------
        //  $                        before an optional \n, and the end of the
        //                           string


        replaceInvalidSeoRegex: new RegExp(/[^@a-zA-Z\d%\.]+|[\.]+$/g)
        //  NODE                     EXPLANATION
        //--------------------------------------------------------------------------------
        //  [^@a-zA-Z\d%\.]+         any character except: '@', 'a' to 'z', 'A'
        //                           to 'Z', digits (0-9), '%', '\.' (1 or more
        //                           times (matching the most amount possible))
        //--------------------------------------------------------------------------------
        //  |                        OR
        //--------------------------------------------------------------------------------
        //  [\.]+                    any character of: '\.' (1 or more times
        //                           (matching the most amount possible))
        //--------------------------------------------------------------------------------
        //  $                        before an optional \n, and the end of the
        //                           string

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
    },

    toValidSeoSlug: function(slug, replaceString) {
        if (!slug) {
            return slug;
        }
        replaceString = replaceString || '-';
        return slug.replace(Taco.core.util.Validation.getReplaceInvalidSeoRegex(), replaceString).toLowerCase();
    }

});