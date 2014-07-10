define(['shim!vendor/typeahead.bundle[modules/jquery-mozu=jQuery]>jQuery', 'hyprlive', 'modules/api'], function($, Hypr, api) {

    // bundled typeahead saves a lot of space but exports bloodhound to the root object, let's lose it
    var Bloodhound = window.Bloodhound.noConflict();

    // bloodhound wants to make its own AJAX requests, and since it's got such good caching and tokenizing algorithms, i'm happy to help it
    // so instead of using the SDK to place the request, we just use it to get the URL configs and the required API headers
    var qs = '%QUERY',
        eqs = encodeURIComponent(qs),
        getApiUrl = function(groups) {
            return api.getActionConfig('suggest', 'get', { query: qs, groups: groups }).url;
        },
        termsUrl = getApiUrl('terms'),
        productsUrl = getApiUrl('products'),
        ajaxConfig = {
            headers: api.getRequestHeaders()
        },
        i,
        nonWordRe = /\W+/,

    // create bloodhound instances for each type of suggestion

    AutocompleteManager = {
        datasets: {
            terms: new Bloodhound({
                datumTokenizer: function(datum) {
                    return datum.suggestion.term.split(nonWordRe);
                },
                queryTokenizer: Bloodhound.tokenizers.whitespace,
                remote: {
                    url: termsUrl,
                    wildcard: eqs,
                    filter: function(res) {
                        var suggestionGroups = res.suggestionGroups,
                            thisGroup;
                        for (i = suggestionGroups.length - 1; i >= 0; i--) {
                            if (suggestionGroups[i].name === "Terms") {
                                thisGroup = suggestionGroups[i];
                                break;
                            }
                        }
                        return thisGroup.suggestions;
                    },
                    ajax: ajaxConfig
                }
            })
        }
    };

    $.each(AutocompleteManager.datasets, function(name, set) {
        set.initialize();
    });

    $(document).ready(function() {
        var $field = AutocompleteManager.$typeaheadField = $('[data-mz-role="searchquery"]');
        AutocompleteManager.typeaheadInstance = $field.typeahead({
            minLength: 3,
            highlight: true,
        },
        {
            name: 'terms',
            displayKey: function(datum) {
                return datum.suggestion.term;
            },
            source: AutocompleteManager.datasets.terms.ttAdapter()
        }).data('ttTypeahead');
    });

    return AutocompleteManager;
});