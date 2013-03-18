using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Mozu.SiteBuilder.Mvc.Models.CMS;

namespace Mozu.SiteBuilder.Mvc.Themes.Factories
{
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
        class PageTemplateDefinitionEQ : IEqualityComparer<PageTemplateDefinition>
        {

            public bool Equals(PageTemplateDefinition x, PageTemplateDefinition y)
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

            public int GetHashCode(PageTemplateDefinition obj)
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
            var pageTypes = new Dictionary< string,Models.CMS.PageTemplateDefinition> ();
            var widgets = new Dictionary<string, Models.CMS.WidgetDefinition>();


            if (theme.Parent == null)
            {
                return;
            }
            if (theme.Parent.Widgets != null)
            {
                theme.Widgets = theme.Widgets.Union(theme.Parent.Widgets, new WidgetDefinitionEQ()).ToList();

            }
             if (theme.Parent.PageTypes  != null)
            {
                theme.PageTypes = theme.PageTypes.Union(theme.Parent.PageTypes, new PageTemplateDefinitionEQ() ).ToList();

            }
            
        }
    }
}
