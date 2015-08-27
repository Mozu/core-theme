namespace Mozu.SiteBuilder.UX.Models
{

    /// <summary>
    /// TODO: Update summary.
    /// </summary>
    public interface IEditableContext
    {
        bool IsEditMode { get; set; }
        EditModes? EditMode { get; set; }

        
    }
    public enum EditModes
    {
        page,template,site
    }
}
