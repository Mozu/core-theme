import { MenuItem } from 'primeng/api';

export class LeftNavigationModel {
    navigationTabs: LeftNavigationTabs [];
    filteredNavigationLinks: LeftNavigationTabs [];
    secureForm: SecureForm[];
    dynamicLinkIframeURL: any;
    mainItems: MenuItem[];
    systemItems: MenuItem[];
    homeURL : string;
    isSideBarModal : boolean;
    isShowSearchComponent : boolean;
    linkColors: string[]  = ['kibo-purple', 'kibo-green', 'kibo-blue', 'kibo-orange'];
    mainHelpLinkStyleClass: string;
    systemHelpLinkStyleClass: string;   
}

export class LeftNavigationTabs {
    navParent: string;
    label: string;
    visible: boolean;
    showBreadCrumbs: boolean;
    breadCrumbOnly: boolean;
    behaviorIds: any;
    viewDependent: any;
    location: string;
    href: string;
    _id: string;
    isSubNavLink: boolean;
    guid: string;
    windowTitle: string;
    parentId: string;
    path: any;
    badgeImage: string;
    badgeInitials: string;
    appId: string;
    modalWindowTitle: string;
    displayMode: string;
    locAtts: any;
    navUrl: string;
    command: () => any;

    constructor() {
        this.visible = true;
    }
}

export interface SecureForm {
    dateStamp: Date;
    messageHash: string;
}

export class LeftNavigationHamburgerMenu {
    homeLabel: string;
    mainLabel: string;
    systemLabel: string;
    importExport: string;
}