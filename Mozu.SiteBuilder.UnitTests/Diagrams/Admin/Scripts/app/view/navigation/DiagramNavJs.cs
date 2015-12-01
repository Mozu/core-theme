using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Mozu.SiteBuilder.UnitTests.Diagrams.Admin.Scripts.app.view.navigation
{

    internal class ExtContainerContainer { }

    internal class ExtViewView { }

    internal class TacoCoreDataModel
    {

    }

    internal class TacoModelNavigationItem : TacoCoreDataModel
    {
        public bool visible { get; set; }
        public bool showBreadCrumbs { get; set; }
        public bool breadCrumbOnly { get; set; }
        public int[] behaviorIds { get; set; }
        public object viewDependent { get; set; }
    }

    internal class TacoViewNavigationPrimaryMenu: ExtContainerContainer
    {
        TacoViewNavigationPrimaryMenuView view { get; set; }

        private void initComponent()
        {
        }

        private void bindStore()
        {
        }

        private bool compareController(string address, string controllerName)
        {
            return true;
        }

        private void onStateChange(object appState)
        {
        }

        private object findNavRecords(object store, object appStateAddress)
        {
            return null;
        }

        private void syncBreadcrumbs(object parent, object selected)
        {
        }

        private void showMenu()
        {
        }

        private void hideMenu()
        {
        }

    }

    internal class TacoViewNavigationPrimaryMenuView: ExtViewView
    {


        TacoViewNavigationPrimarySubMenu[] subMenus { get; set; }

        void initComponent() { }

        void injectSubmenus() { }

        void navigate(string view, object record, object item, int index, object e) { }

        void syncSelection(object selModel, object record) { }

        string parseUri(string uri)
        {
            return null;
        }

    }

    class TacoViewNavigationPrimarySubMenu: ExtViewView
    {
        void initComponent() { }

        void buildFlyoutMenuConfig(object[] items, object menuCfg) { }

        void navigate(string view, object record, object item, int index, object e) { }

    }

    class ExtComponent { }

    class TacoViewNavigationPrimarySubMenuItem: ExtComponent
    {
        string tpl { get; set; }

        void initComponent() { }

        bool onClick(object e)
        {
            return true;
        }
    }

    class TacoViewNavigationSecondaryMenu: ExtContainerContainer
    {
        void initComponent() { }

        void bindSettingsStore() { }
    }

    class TacoStoreNavigation
    {
        private TacoModelNavigationItem[] proxyData;

        void beforeLoad(object store)
        {
            
        }

        bool filterFn(object record)
        {
            return false;
        }

    }


}
