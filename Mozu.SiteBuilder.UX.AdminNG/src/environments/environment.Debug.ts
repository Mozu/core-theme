// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.
export const debugUrl = false;

export const environment = {
    production: false,
    environmentName: 'Debug',
    debug: false,
    domain: '.client1.com',
<<<<<<< HEAD
    appUrl: debugUrl ? window.location.origin : window.location.origin + '/admin/',
=======
    appUrl: window.location.origin + '/admin/',
>>>>>>> AUAU-73 Global Search Bar functionality and UI added
    apiUrl: window.location.origin + '/admin/app',
    errorPageUrl: window.location.origin + '/admin/',
    apiTokenUrl: 'http://localhost:5100/token',
    accountUrl: 'https://t19636.ngdev06.kibong-dev.com/Admin',
    fulfillerUrl: 'http://services-tp-dev01.kubedev.kibo-dev.com/fulfillment-ui/dashboard/'
};
