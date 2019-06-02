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

export enum NotificationLGActions {
    save = "Save",
    cancel = "Cancel",
    edit = "Edit",
    selectedLocationWithDetails ="selectedLocationWithDetails",
    editDataLoaded = "EditDataLoaded",
    cancelled = "Cancelled",
    saved = "Saved"

}

export enum LocationGroupEventOperations {
    add = "add",
    remove = "remove"
}