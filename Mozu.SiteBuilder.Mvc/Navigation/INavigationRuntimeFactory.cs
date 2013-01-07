using System;
using Mozu.SiteBuilder.UX.Models.Navigation;
using System.Collections.Generic;
namespace Mozu.SiteBuilder.Mvc.Navigation
{
    public interface INavigationRuntimeFactory
    {
        Mozu.SiteBuilder.UX.Models.Navigation.NavigationRuntimeNodeCollection GetNavigation();

        List<NavigationRuntimeNode> Primary
        {
            get;
        }
        List<NavigationRuntimeNode> Secondary
        {
            get;
        }
    }
}
