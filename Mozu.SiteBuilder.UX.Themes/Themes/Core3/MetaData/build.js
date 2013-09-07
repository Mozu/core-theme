({
    paths: {
        jquery: "empty:",
        sdk: "empty:",
        knockout: "vendor/knockout-latest",
        pciaas: "vendor/pci-temp"
    },
    dir: "Scripts-Built",
    locale: "en-us",
    optimize: "uglify",
    keepBuildDir: true,
    optimizeCss: "none",
    removeCombined: true,
    skipPragmas: true,
    modules: [
        {
            name: "modules/common",
            include: [
                'knockout',
                'modules/api',
                'modules/animatemodals',
                'modules/cart-monitor',
                'modules/function-debouncer',
                'modules/jquery-plus',
                'modules/loading-bars',
                'modules/login-links',
                'modules/knockout-viewmodel',
                'modules/knockout-plus',
                'modules/models-user',
                'modules/models-address',
                'modules/models-product',
                'modules/models-faceting',
                'modules/tagcloud'
            ],
            exclude: ['jquery', 'sdk', 'pciaas', 'text', 'shim', 'i18n'],
        },
        {
            name: "pages/product",
            exclude: ["modules/common", 'text', 'shim', 'i18n']
        },
        {
            name: "pages/category",
            exclude: ["modules/common", 'text', 'shim', 'i18n']
        },
        {
            name: "pages/cart",
            exclude: ["modules/common", 'text', 'shim', 'i18n']
        },
        {
            name: "pages/checkout",
            exclude: ["modules/common", 'pciaas', 'text', 'shim', 'i18n']
        },
        {
            name: "pages/myaccount",
            exclude: ["modules/common", 'text', 'shim', 'i18n']
        }
    ]
});
