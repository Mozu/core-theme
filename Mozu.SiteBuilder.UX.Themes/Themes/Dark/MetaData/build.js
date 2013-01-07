module.exports = ({

    paths: {
        jquery: "empty:",
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
                'knockout',
                'modules/knockout-viewmodel',
                'modules/knockout-plus'
            ],
            exclude: ['jquery']
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
