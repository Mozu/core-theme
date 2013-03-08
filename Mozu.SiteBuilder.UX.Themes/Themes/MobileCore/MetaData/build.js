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
            name: "pages/common",
            include: [
                'modules/jquery-mobileevents',
                'knockout',
                'text',
                'ajax',
                'shim',
                'modules/api',
                'modules/actions-processor',
                'modules/animatemodals',
                'modules/jquery-sitemenu',
                'modules/loading-bars',
                'modules/login-links',
                'modules/message-dismisser',
                'modules/knockout-viewmodel',
                'modules/knockout-plus',
                'modules/tagcloud'
            ],
            exclude: ['jquery', 'sdk'],
        },
        {
            name: "pages/product",
            exclude: ["pages/common"],
            insertRequire: ["pages/product"]
        },
        {
            name: "pages/checkout",
            exclude: ["pages/common"],
            insertRequire: ["pages/checkout"]
        },
        {
            name: "pages/myaccount",
            exclude: ["pages/common"],
            insertRequire: ["pages/myaccount"]
        }
    ]
});
