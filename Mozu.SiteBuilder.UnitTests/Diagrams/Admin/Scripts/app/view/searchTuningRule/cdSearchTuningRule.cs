using Mozu.SiteBuilder.UnitTests.Diagrams.Admin.Scripts.app.view.product;

namespace Mozu.SiteBuilder.UnitTests.Diagrams.Admin.Scripts.app.view.searchTuningRule
{
    class TacoWindowWindow { }

   

    class TacoWindowModal : TacoWindowWindow
    {
         
    }

    class TacoCoreUxWindowDrawer : TacoWindowModal {}

    class TacoModalProductRankingEditor : TacoCoreUxWindowDrawer
    {
        public TacoProductRankingForm Form;
    }

    class ExtPanel { }

    class TacoFullEditor : ExtPanel { }

    class TacoProductRankingEdit : TacoFullEditor
    {
        public TacoProductRankingForm Form;
    }

    class TacoFormForm : ExtPanel { }

    class TacoNavForm2 : TacoFormForm { }

    class TacoProductRankingForm : TacoNavForm2
    {
        public TacoProductRankingGeneralForm general;
        public TacoProductRankingContextForm context;
        public TacoProductRankingPinnedProductForm pinned;
        public TacoProductRankingBlockedProductForm blocked;
    }
    
    class TacoProductRankingGeneralForm : TacoFormForm { }

    class TacoProductRankingContextForm : TacoFormForm { }

    class TacoProductRankingPinnedProductForm : TacoFormForm { }
            
    class TacoProductRankingBlockedProductForm : TacoFormForm { }

    class ExtGridPanel { }

    class TacoCoreUxGridPanel : ExtGridPanel
    {
        public bool rowLines = true;
        public bool enableTextSelection = true;
        public bool stripeRows = false;
    }

    class TacoSearchList : TacoCoreUxGridPanel
    {
        public bool launchEditorOnClick = false;
        public bool enableNavHeader = false;
        public bool enableSearch = true;
        public bool enablePaging = true;
        public bool hideSearchToolbar = false;
        public bool enableAutoSelect = true;
        public object[] secondToolbarItems = null;


        public TacoCoreUxMixinsNavHeader NavHeader { get; set; }
        public TacoCoreUxMixinsPageable Pageable { get; set; }
        public TacoCoreUxMixinsSearchable Searchable { get; set; }
        public TacoCoreUxGridPluginsAutoSelect autoSelect { get; set; }

        public TacoCoreUxMixinsLaunchEditor launchEditor { get; set; }

        public TacoCoreUxMixinsRowEditable rowEditable { get; set; }

        public TacoCoreUxMixinsDeleteFromGrid deleteFromGrid { get; set; }

        public TacoCoreUxMixinsGridContextMenu gridContextMenu { get; set; }

        public void initComponent() { }
    }

    

    class TacoCoreUxMixinsNavHeader { }
    class TacoCoreUxMixinsPageable { }
    class TacoCoreUxMixinsSearchable { }
    class TacoCoreUxGridPluginsAutoSelect { }
    class TacoCoreUxMixinsLaunchEditor { }
    class TacoCoreUxMixinsRowEditable { }
    class TacoCoreUxMixinsDeleteFromGrid { }
    class TacoCoreUxMixinsGridContextMenu { }

    class TacoProductRankingGrid : TacoSearchList
    {

    }

    class TacoProductRankingIndex: TacoProductRankingGrid { }

}
