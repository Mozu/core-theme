using System;
using System.Collections.Generic;
using System.Runtime.Serialization;

namespace Mozu.SiteBuilder.UX.Models.Navigation
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
                Nodes = new List<NavigationNode>()
                { new NavigationNode()
                      {
                          Id =NavigationNode.JoinParts("pages", "home"),
                          ParentId = NavigationNode.JoinParts("group", "nav"),
                          Name="Home",
                          NodeType ="page",
                          Url="/pages/home",
                          Index =0

                      },
                      new NavigationNode()
                    {
                        Id = "topcat",
                        ParentId = NavigationNode.JoinParts("group", "nav"),
                        Index =1

                    }

                }
            };
        }
    }
}