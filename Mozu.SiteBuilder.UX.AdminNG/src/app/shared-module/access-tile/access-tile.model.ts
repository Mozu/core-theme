
export class AccessTileModel {
    sectionText: string;
    sectionLinks: AccessTileLink [];
    sectionImageURL: string;
    navParent: string;
    id: string;
}

export class AccessTileLink {
    linkDataURL: string;
    linkDataText: string;
}
