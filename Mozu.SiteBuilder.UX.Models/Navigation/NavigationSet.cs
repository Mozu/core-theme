using System;
using System.Collections.Generic;
using System.Runtime.Serialization;

namespace Mozu.SiteBuilder.UX.Models.Navigation
{
    [DataContract]
    public class NavigationSet
    {
        public NavigationSet()
        {
            Nodes = new List<NavigationNode>();
        }

        [DataMember(Name = "nodes", EmitDefaultValue = false)]
        public List<NavigationNode> Nodes { get; set; }

    }
}