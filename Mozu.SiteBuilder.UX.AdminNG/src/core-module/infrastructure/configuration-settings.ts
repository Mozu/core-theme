
export let ConfigurationSettings = {
    isRethrowErrorInsideGlobalErrorHandler: false,
    isUnwrapErrorInsideGlobalErrorHandler: true,
    islogErrorToConsoleInsideGlobalErrorHandler: true,
    isSendErrorToServerInsideGlobalErrorHandler: true,
    isShowErrorDialogInsideGlobalErrorHandler: true,
    supportedBrowserLanguages: ['en', 'en-us', 'en-gb', 'fr'],
    fallbackBrowserLanguage: 'en'
};

export let ToastrOptions: any = {
    animate: 'fade',
    positionClass: 'toast-top-full-width',
    dismiss: 'click',
    maxShown: 1,
    showCloseButton: true,
    newestOnTop: true
};

export let AutoCloseToastrOptions: any = {
    toastLife: 5000, // in miliseconds
    dismiss: 'auto'
};

export let CustomToastrOptions: any = {
    toastLife: 5000,  // in miliseconds
    dismiss: 'auto',
    enableHTML: true
};

export let SystemMessageToastrOptions: any = {
    toastLife: 5000,  // in miliseconds
    dismiss: 'click',
    showCloseButton: false,
    enableHTML: true
};
