({
    paths: {
        jquery: "empty:",
        sdk: "empty:",
        knockout: "vendor/knockout-latest",
        pciaas: "vendor/pci-temp"
    },
    dir: "compiled/scripts/",
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
                'modules/api',
                'modules/backbone-mozu-model',
                'modules/backbone-mozu-validation',
                'modules/backbone-mozu-build',
                'modules/backbone-mozu',
                'modules/cart-monitor',
                'modules/jquery-mozu',
                'modules/login-links',
                'modules/mixin-paging',
                'modules/models-address',
                'modules/models-faceting',
                'modules/models-messages',
                'modules/models-product',
                'modules/views-messages',
                'modules/views-paging'
            ],
            exclude: ['jquery', 'pciaas'],
        },
        {
            name: "pages/product",
            exclude: ["modules/common"]
        },
        {
            name: "pages/category",
            exclude: ["modules/common"]
        },
        {
            name: "pages/cart",
            exclude: ["modules/common"]
        },
        {
            name: "pages/checkout",
            exclude: ["modules/common", 'pciaas']
        },
        {
            name: "pages/myaccount",
            exclude: ["modules/common"]
        }
    ]
});
