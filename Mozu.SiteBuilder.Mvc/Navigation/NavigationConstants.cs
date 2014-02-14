using System;

namespace Mozu.SiteBuilder.Mvc.Navigation
{
    public static class NavigationConstants
    {
        // the top level name in EXT's tree thing (a root pseudo-node).
        public const string SUPER_ROOT_NODE_NAME = "root";

        // the top level name for items that exist in the navigation tree.
        public const string NAV_ROOT_NODE_NAME = "_navigation";

        // the special node to assign unlinked pages as a child of.
        public const string UNLINKED_PAGES_NODE_ID = "_unlinked";
    }
}
