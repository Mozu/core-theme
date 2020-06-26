/** 
 * @class Taco.util.Validation
 * common validation methods
 * */
Ext.define('Taco.core.util.Validation', {
    singleton: true,

    constructor: function (config) {
        this.initConfig(config);
    },
    config: {

        //not il18n friendly
        seoFriendlyRegex: new RegExp(/^[a-z0-9-_\.()]*[a-z0-9-_()]$/i),
        //RegEx documentation below is taken from http://rick.measham.id.au/paste/explain.pl
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


        replaceInvalidSeoRegex: new RegExp(/[^a-zA-Z\d\.]+|[\.]+$/g)
        //  NODE                     EXPLANATION
        //--------------------------------------------------------------------------------
        //  [^a-zA-Z\d\.]+         any character except: 'a' to 'z', 'A'
        //                           to 'Z', digits (0-9), '\.' (1 or more
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
    validateSeoFriendlyText: function (value) {
        var seoFriendlyRegex = Taco.core.util.Validation.getSeoFriendlyRegex(),
            isValid = !value || seoFriendlyRegex.test(value);
        if (!isValid) {
            return Localizer.langResources.SHARED.ValidationMsg.invalid_format_seofriendly_msg;
        }
        return true;
    },

    /**
     * Validates queryString text is URL friendly.  Allows empty.
     * @param value text value
     * @returns if passes validation then returns true, else returns error string
     */
    validateQueryString: function (value) {
        var queryStringRegex = Taco.core.util.Validation.getQueryStringRegex(),
            isValid = !value || queryStringRegex.test(value),
            validationMsg;
        if (!isValid) {
            validationMsg = Localizer.langResources.SHARED.ValidationMsg.invalid_format_special_character;
            if (value.endsWith('.')) {
                validationMsg += '  ' + Localizer.langResources.SHARED.ValidationMsg.periods_not_allowed_error_msg;
            }
            return validationMsg;
        }
        return true;
    },

    toValidSeoSlug: function (slug, replaceString) {
        if (!slug) {
            return slug;
        }
        replaceString = replaceString || '-';
        return slug.replace(Taco.core.util.Validation.getReplaceInvalidSeoRegex(), replaceString).toLowerCase();
    },



    /*
    *  Validates start date is before end date.  Can pass requiredCount of 0, 1 or 2 to enforce at number of fields required.
    *  Defaults to 0.  Pass in different end & start msg.
    *  validator: function() {
    *    return Taco.core.util.Validation.validateDateRange(me.activeStartDateField, me.activeEndDateField,
    *      "End date must be after start date", 0);
    *  }
     */
    validateDateRange: function (startDateFld, endDateFld, endBeforeStartMsg, requiredCount) {
        requiredCount = requiredCount || 0;

        if (requiredCount === 0 && (!startDateFld.getValue() || !endDateFld.getValue())) {
            return true;
        } else if (requiredCount >= 1 && (!startDateFld.getValue() && !endDateFld.getValue())) {
            return Localizer.langResources.SHARED.ValidationMsg.date_range_error_msg + " " + (requiredCount == 1 ? Localizer.langResources.SHARED.ValidationMsg.or_text : Localizer.langResources.SHARED.ValidationMsg.and_text) + " " + Localizer.langResources.SHARED.ValidationMsg.end_date_text;
        }

        var startDate = startDateFld.parseDate(startDateFld.getValue());
        var endDate = endDateFld.parseDate(endDateFld.getValue());
        if ((startDate && endDate) && (startDate >= endDate)) {
            return endBeforeStartMsg;
        }
        return true;
    }

});