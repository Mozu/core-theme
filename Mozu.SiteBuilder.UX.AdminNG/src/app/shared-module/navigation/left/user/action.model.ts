import { MenuItem } from 'primeng/api';

export class NavigationLeftUserActionModel {
    tenantName: string;
    loggedInUserName: string;
    loggedInUserInitials: string;
    userRedirectionLinks: MenuItem;
    showSwitchAdminButton: boolean;
    switchToClassicUI: string;
}
