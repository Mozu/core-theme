export enum BusinessRulesErrorCodes {
    PasswordExpired = <any>'BR104'
}

export enum SortOrder {
    Asc = 1,
    Desc = 2
}

export enum RegExType {
    negativedecimalPrecisionFour = <any>'negativedecimalPrecisionFour',
    decimalPrecisionFour = <any>'decimalPrecisionFour'
}

export enum NavigationContainerType {
    dashboard = 'dashboard',
    product = 'product',
    order = 'order',
    quotes = 'quotes',
    locationGroups = 'locationGroups'
}

export enum ConfirmationDialogNotificationCode {
    DeleteQuoteItem = 'DeleteQuoteItem',
    SaveItem = 'SaveItem',
    DeleteLocationGroup = 'DeleteLocationGroup',
    Cancel = 'Cancel',
    LGCUnSavedChanges = 'LGCUnSavedChanges'
}

export enum ConfirmationDialogNotificationType {
    Confirmation = 'Confirmation',
    Information = 'Information'
}

export enum NotificationLGActions {
    save = 'Save',
    cancel = 'Cancel',
    edit = 'Edit',
    selectedLocationWithDetails = 'selectedLocationWithDetails',
    editDataLoaded = 'EditDataLoaded',
    cancelled = 'Cancelled',
    saved = 'Saved',
    list = 'List',
    ConfirmationDialogPrimaryBtnAct = 'ConfirmationDialogPrimaryBtnAct',
    ConfirmationDialogSecondaryBtnAct = 'ConfirmationDialogSecondaryBtnAct',
    navigateFromLeftMenu = 'NavigateFromLeftMenu',
    locationGroupConfigUpdate = "LocationGroupConfigUpdate"
}

export enum LocationGroupEventOperations {
    add = 'add',
    remove = 'remove'
}

export enum NotificationQuoteActions {
    list = 'List',
    edit = 'Edit'
}


export enum SubtotalOptions {
    subTotalExclTax = 'subTotalExclTax',
    subTotalInclTax = 'subTotalInclTax',
    estimatedTax = 'estimatedTax'
}

export enum NegotiatedPriceDiscount {
    percentageDiscount = 'percentageDiscount',
    amountDiscount = 'amountDiscount',
    proposedPrice = 'proposedPrice'
}

export enum QuoteFilterStatus {
    New = 'New',
    Open = 'Open',
    cancelled = 'Cancelled',
    buyerRevision = 'Buyer Revision',
    Declined = 'Declined',
    Expired = 'Expired',
    sellerAccepted = 'Seller Accepted',
    Ordered = 'Ordered'
}
