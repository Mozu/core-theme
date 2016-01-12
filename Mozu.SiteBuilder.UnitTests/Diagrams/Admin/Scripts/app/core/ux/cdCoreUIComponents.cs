namespace Mozu.SiteBuilder.UnitTests.Diagrams.Admin.Scripts.app.core.ux
{
    class TacoCoreUxWindowWindow
    {
        public bool manageOverflow;
        public Scale scale;
        public bool autoShow;
        public bool constrain;
        public bool draggable;
        public bool minHeight;
        public bool minWidth;
        public bool modal;
        public bool resizable;

    }

    enum Scale
    {
        small,
        medium,
        large
    }

   

    class TacoCoreUxWindowModal : TacoCoreUxWindowWindow
    {
        public object actionBar;
        public object[] actions;
        public string primaryText;
        public bool scopeActionsToWindow;
        public string secondaryText;
        public bool closable;
        public bool draggable;
        public bool modal;
        public bool resizable;
        public bool isSave;
        public bool closeOnSave;
        public object saveData;
        public bool enableKeyMap;
        public object config_form;
        public bool showActionsBar;

        public Event beforecancel { get; set; }
        public Event cancel { get; set; }
        public Event afterclose { get; set; }
        public Event aftersaveclose { get; set; }
        public Event aftercancelclose { get; set; }
        public Event beforesave { get; set; }
        public Event save { get; set; }
        public Event savesuccess { get; set; }

        public bool onSave()
        {
            return true;
        }
        public bool onSaveSuccess() { return true; }

        public object getForm()
        {
            return null;
        }

    }

    class TacoCoreUxWindowDrawer : TacoCoreUxWindowModal
    {
        public int minHeight;
        public int minWidth;
        public object resizable;

        public void attachResizerListeners() { }
        public void constrainResizer() { }
        public void handleResize() { }
    }

   
    class ExtPanel { }

    class TacoFullEditor : ExtPanel { }

  

    class TacoFormForm : ExtPanel { }

    class TacoNavForm2 : TacoFormForm { }

    

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



    class TacoCoreUxMixinsNavHeader
    {
        public bool isModalWrapper;
        public bool createOnSaveSuccess;
        public bool enableSaveActionToggle;
        public bool createButtonEnabled;
        public bool createButtonVisible;
        public bool createButtonText;
        public bool saveButtonEnabled;
        public bool saveAndCreateButtonEnabled;
        public bool saveButtonVisible;
        public bool cancelButtonEnabled;
        public bool cancelButtonVisible;
        public string title;
        public object titlePanel;


        public Event beforecancel { get; set; }
        public Event cancel { get; set; }
        public Event beforesave { get; set; }
        public Event save { get; set; }
        public Event savesuccess { get; set; }



        public bool onSave() { return true; }

        public bool onSaveSuccess() { return true; }

        public bool onSaveFailure() { return true; }

        public bool onCancel() { return true; }

        public bool onCreate() { return true; }

        public bool doSave() { return true; }

        public bool saveSuccess(object data) { return true; }

    }
    class TacoCoreUxMixinsPageable { }
    class TacoCoreUxMixinsSearchable { }
    class TacoCoreUxGridPluginsAutoSelect { }
    class TacoCoreUxMixinsLaunchEditor { }
    class TacoCoreUxMixinsRowEditable { }
    class TacoCoreUxMixinsDeleteFromGrid { }
    class TacoCoreUxMixinsGridContextMenu { }

    class TacoCoreUxMixinsPermissions { }

    class Event
    {
         
    }

}
