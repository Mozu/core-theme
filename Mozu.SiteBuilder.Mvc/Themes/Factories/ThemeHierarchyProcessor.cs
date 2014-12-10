using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Mozu.SiteBuilder.Mvc.Models.CMS;

namespace Mozu.SiteBuilder.Mvc.Themes.Factories
{
    [Obsolete]
    class ThemeHierarchyProcessor
    {
        class WidgetDefinitionEQ: IEqualityComparer<WidgetDefinition>
        {

            public bool Equals(WidgetDefinition x, WidgetDefinition y)
            {
                if (x.Id == null && y.Id == null)
                {
                    return true;
                }
                if (x.Id == null || y.Id == null)
                {
                    return false;
                }
                return x.Id == y.Id;
            }

            public int GetHashCode(WidgetDefinition obj)
            {
                if (obj == null)
                {
                    return -1;
                }
                return obj.Id.GetHashCode();
            }
        }
        class EditorDefinitionEQ : IEqualityComparer<EditorDefinition>
        {

            public bool Equals(EditorDefinition x, EditorDefinition y)
            {
                if (x.Id == null && y.Id == null)
                {
                    return true;
                }
                if (x.Id == null || y.Id == null)
                {
                    return false;
                }
                return x.Id == y.Id;
            }

            public int GetHashCode(EditorDefinition obj)
            {
                if (obj == null)
                {
                    return -1;
                }
                return obj.Id.GetHashCode();
            }
        }
        class PageTemplateDefinitionEQ : IEqualityComparer<PageTypeDefinition>
        {

            public bool Equals(PageTypeDefinition x, PageTypeDefinition y)
            {
                if (x  == null && y  == null)
                {
                    return true;
                }
                if (x  == null || y  == null)
                {
                    return false;
                }
                return x.Id == y.Id;
            }

            public int GetHashCode(PageTypeDefinition obj)
            {
                if (obj == null || obj.Id == null )
                {
                    return -1;
                }
                return obj.Id.GetHashCode();
            }
        }
        public void Process(Theme theme)
        {
            var pageTypes = new Dictionary< string,Models.CMS.PageTypeDefinition> ();
            var widgets = new Dictionary<string, Models.CMS.WidgetDefinition>();


            if (theme.Parent == null)
                return;
            if (theme.Parent.Widgets != null)
                theme.Widgets = theme.Widgets.Union(theme.Parent.Widgets, new WidgetDefinitionEQ()).ToList();

            if (theme.Parent.Editors != null)
                theme.Editors = theme.Editors.Union(theme.Parent.Editors, new EditorDefinitionEQ()).ToList();
        
            if (theme.Parent.PageTypes  != null)
                theme.PageTypes = theme.PageTypes.Union(theme.Parent.PageTypes, new PageTemplateDefinitionEQ() ).ToList();

            if (theme.Parent.EmailTemplates != null)
                theme.EmailTemplates = theme.EmailTemplates.Union(theme.Parent.EmailTemplates, new PageTemplateDefinitionEQ()).ToList();

            if (theme.Parent.OrderTemplates != null)
                theme.OrderTemplates = theme.OrderTemplates.Union(theme.Parent.OrderTemplates, new PageTemplateDefinitionEQ()).ToList();
            
        }
    }
}
