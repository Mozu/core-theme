using System.Linq;

namespace Mozu.SiteBuilder.UnitTests.Diagrams.Admin.Scripts.app.view.product
{

    public class TacoCoreUxFormForm
    {
        public object[] items { get; set; }
    }

    public class jsNavigable
    {
        public jsNavigable() { }

        public void getWrapper() { }

        public void onAfterRenderNavigable() { }

        public void rebuildMap()
        {
        }

        public void checkTop()
        {
        }

        public void onNavClick()
        {
        }

        public void loadNavItems()
        {
        }

    }

    public class jsNavForm2
    {
        public void initComponent() { }

        public void getWrapper() { }

        public void onAfterRender() { }

        public void rebuildMap() { }

        public void checkTop() { }

        public void onNavClick() { }

        public void loadNavItems(object[] items){ }
    }

    public class jsGlobalForm : TacoCoreUxFormForm
    {
        public jsGlobalForm()
        {
            
        }
        public jsNavigable MixinsNavigable { get; set; }

        public jsGeneral General { get; set; }
        public jsPricing Pricing { get; set; }
        public jsBundle Bundle { get; set; }
        public jsOptions Options { get; set; }
        public jsInventory Inventory { get; set; }
        public jsProperties Properties { get; set; }
        public jsExtras Extras { get; set; }
        public jsShipping Shipping { get; set; }
        public jsSEO SEO { get; set; }

        private void initComponent() { }
        private void buildForm() { }
    }

    public class jsBundleable
    {
        public jsBundleable() { }

        public void initBundleable() { }

        public void updateSubFormVisibility() { }

        public void onProductUsageChange() { }

        public void enableBundling() { }

        public void disableBundling() { }
    }

    public class jsGeneral { }
    public class jsPricing { }
    public class jsBundle { }
    public class jsOptions { }
    public class jsInventory { }
    public class jsProperties { }
    public class jsExtras { }
    public class jsShipping { }
    public class jsSEO { }

    public class jsTacoCoreUxTabPanel
    {
        
    }

    public class jsTacoViewProductForm
    {
        public jsGlobalForm globalForm { get; set; }

        public jsTacoCoreUxTabPanel tabPanel { get; set; }
    }
}
