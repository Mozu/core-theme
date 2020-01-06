import { AccessTileModel  } from '@shared/index';

export class  DashboardModel {
    systemTiles: AccessTileModel[];
    mainTiles: AccessTileModel[];
    isShowSystemTiles: boolean;
    filteredAccessLinks: AccessTileModel[];
    dashboardCSSClass: string;
    linkColors: string[]  = ['kibo-purple', 'kibo-green', 'kibo-blue', 'kibo-orange'];
}
