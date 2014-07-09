define(['shim!vendor/typeahead.bundle[modules/jquery-mozu=jQuery]>jQuery', 'hyprlive', 'modules/api'], function($, Hypr, api) {

    // bundled typeahead saves a lot of space but exports bloodhound to the root object, let's lose it
    var Bloodhound = window.Bloodhound.noConflict();

    //function getSuggestions(query, cb) {
    //    api.get('suggest', query).then(function(res) {
    //        cb(_.map(res.prop('suggestions')))
    //    });
    //}


    var suggestConfig = api.getActionConfig('suggest', 'get', 'MZQUERY');

    var mzSuggestions = new Bloodhound({
        datumTokenizer: Bloodhound.tokenizers.obj.whitespace('suggestion'),
        queryTokenizer: Bloodhound.tokenizers.whitespace,
        remote: {
            url: suggestConfig.url,
            wildcard: 'MZQUERY',
            filter: function(res) {
                return res.suggestions;
            },
            ajax: {
                headers: api.context.asObject('x-vol-')
            }
        }
    });

    mzSuggestions.initialize();

    $(document).ready(function() {
        $('[data-mz-role="searchquery"]').typeahead({
            minLength: 3,
            highlight: true,
        },
        {
            name: 'term-suggestions',
            displayKey: 'suggestion',
            source: mzSuggestions.ttAdapter()
        });
    })
});