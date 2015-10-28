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
        public SearchTuningRuleContextForm context;
        public SearchTuningRulePinnedProductForm pinned;
        public SearchTuningRuleBlockedProductForm blocked;
    }
    
    class TacoSearchTuningRuleGeneralForm : TacoFormForm { }

    class SearchTuningRuleContextForm : TacoFormForm { }

    class SearchTuningRulePinnedProductForm : TacoFormForm { }
            
    class SearchTuningRuleBlockedProductForm : TacoFormForm { }

}
