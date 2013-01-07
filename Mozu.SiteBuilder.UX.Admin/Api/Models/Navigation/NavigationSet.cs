using System;
using System.Collections.Generic;
using System.Runtime.Serialization;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.Navigation
{
    [DataContract]
    public class NavigationSet
    {
        private static readonly Lazy<NavigationSet> _default = new Lazy<NavigationSet>(CreateDefaultNavigationSet);

        public NavigationSet()
        {
            Nodes = new List<NavigationNode>();
        }

        [DataMember(Name = "nodes", EmitDefaultValue = false)]
        public List<NavigationNode> Nodes { get; set; }

        public static NavigationSet Default
        {
            get { return _default.Value; }
        }

        private static NavigationSet CreateDefaultNavigationSet()
        {
            return new NavigationSet
            {
                Nodes = new List<NavigationNode>
                {
                    new NavigationNode { Label = "Pages"},
                    new NavigationNode { Label = "Themes"},
                    new NavigationNode { Label = "Widgets"},
                }
            };
        }
    }
}