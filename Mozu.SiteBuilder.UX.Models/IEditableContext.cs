// -----------------------------------------------------------------------
// <copyright file="IEditableContext.cs" company="Microsoft">
// TODO: Update copyright text.
// </copyright>
// -----------------------------------------------------------------------

namespace Mozu.SiteBuilder.UX.Models
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Text;

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
        Page,Template,Site
    }
}
