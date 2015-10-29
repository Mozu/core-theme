using Mozu.SiteBuilder.UnitTests.Diagrams.Admin.Scripts.app.view.product;

namespace Mozu.SiteBuilder.UnitTests.Diagrams.Admin.Scripts.app.view.searchTuningRule
{
    class TacoWindowWindow { }

    class TacoWindowModal : TacoWindowWindow
    {
         
    }

    class TacoCoreUxWindowDrawer : TacoWindowModal {}

    class TacoModalSearchTuningRuleEditor : TacoCoreUxWindowDrawer
    {
        public TacoSearchTuningRuleForm Form;
    }

    class ExtPanel { }

    class TacoFullEditor : ExtPanel { }

    class TacoSearchTuningRuleEdit : TacoFullEditor
    {
        public TacoSearchTuningRuleForm Form;
    }

    class TacoFormForm : ExtPanel { }

    class TacoNavForm2 : TacoFormForm { }

    class TacoSearchTuningRuleForm : TacoNavForm2
    {
        public TacoSearchTuningRuleGeneralForm general;
        public TacoSearchTuningRuleContextForm context;
        public TacoSearchTuningRulePinnedProductForm pinned;
        public TacoSearchTuningRuleBlockedProductForm blocked;
    }
    
    class TacoSearchTuningRuleGeneralForm : TacoFormForm { }

    class TacoSearchTuningRuleContextForm : TacoFormForm { }

    class TacoSearchTuningRulePinnedProductForm : TacoFormForm { }
            
    class TacoSearchTuningRuleBlockedProductForm : TacoFormForm { }

    class ExtGridPanel { }

    class TacoGridPanel : ExtGridPanel { }

    class TacoSearchList : TacoGridPanel { }

    class TacoSearchTuningRuleGrid: TacoSearchList { }

    class TacoSearchTuningRuleIndex: TacoSearchTuningRuleGrid { }

}
