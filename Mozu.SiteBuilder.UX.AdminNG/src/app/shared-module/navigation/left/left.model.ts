export class LeftNavigationModel {
    navigationTabs : LeftNavigationTabs [];
}

export class LeftNavigationTabs {
    navParent : string;
    label : string;
    visible: boolean;
    showBreadCrumbs : boolean;
    breadCrumbOnly : boolean;
    behaviorIds : any;
    viewDependent : any;
    location : string;
    href : string;
    _id : string;
    isSubNavLink : boolean;
    guid : string;
    windowTitle : string;
    parentId : string;
    path : any;
    badgeImage : string;
    badgeInitials : string;
    appId : string;
    modalWindowTitle : string;
    displayMode : string;
    locAtts : any;

    constructor() {
        this.visible = true;
    }
}