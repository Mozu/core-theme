
export class AccessTileModel {
    sectionText: string;
    sectionLinks: AccessTileLink [];
    sectionImageURL: string;
    navParent: string;
    id: string;
    tileIcon: string;
    tileIconColor: string;
}

export class AccessTileLink {
    linkDataURL: string;
    linkDataText: string;
}
