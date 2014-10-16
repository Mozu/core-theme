using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Mozu.SiteBuilder.UnitTests.Diagrams.Admin.Scripts.app.view.product
{

    class cdTacoViewProductIndex : cdTacoCoreUxBrowserBrowserPage
    {
        
    }

    class cdTacoCoreUxBrowserBrowserPage : cdTacoCoreUxContentContainer
    {
        public cdTacoCoreUxBrowserBrowsable mixin;
    }

    class cdTacoCoreUxBrowserBrowsable
    {
        public cdTacoCoreUxBrowserItemBrowser itemBrowser;
    }

    class cdTacoCoreUxBrowserItemBrowser
    {
        public cdTacoCoreUxFormFilterContainer searchBox;
    }

    class cdTacoCoreUxMixinsSearchable
    {
        public cdTacoCoreUxFormFilterContainer searchBox;
    }

    class cdTacoCoreUxBrowserSearchList
    {
        public cdTacoCoreUxMixinsSearchable mixin;
    }

    class cdTacoCoreUxContentContainer
    {
        
    }

    class cdTacoCoreUxFormFilterContainer
    {
        
    }

    class cdTacoViewProductModal
    {
        public cdTacoCoreUxFormFilterContainer searchBox;
    }
}
