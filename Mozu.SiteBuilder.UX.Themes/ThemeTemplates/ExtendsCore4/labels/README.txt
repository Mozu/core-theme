 Mozu Theme Scaffolding                                                    v1.0
================================================================================

The `labels` directory is for localizations (translations of all the text labels 
on your storefront). Each localization should be a JSON file, named after an
L10N locale code (e.g. en-US.json or fr-CA.json). The structure of the JSON file
is simple: each key is a label name, and each value is the text of the label.

    {
        "sampleLabel"       : "This is an example label.",
        "acceptsMarketing"  : "Yes, I want to receive special offers from {0}!"
    }

Note that labels can be formatted to be used in string_format filters.

The Core theme comes with one localization, U.S. English. (U.S. English is the
default locale for Mozu stores, so the U.S. English labels will be used if the
user's current locale is unknown or unsupported.