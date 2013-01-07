// -----------------------------------------------------------------------
// <copyright file="NavigationRuntimeNode.cs" company="Microsoft">
// TODO: Update copyright text.
// </copyright>
// -----------------------------------------------------------------------

namespace Mozu.SiteBuilder.UX.Models.Navigation
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Text;
    using System.Runtime.Serialization;


    [DataContract]
    public class NavigationRuntimeNodeCollection : ModelBase
    {
        [DataMember(Name = "items")]
        public List<NavigationRuntimeNode> Primary
        {
            get;
            set;
        }
        [DataMember(Name = "items")]
        public List<NavigationRuntimeNode> Secondary
        {
            get;
            set;
        }

    }

    /// <summary>
    /// TODO: Update summary.
    /// </summary>
    /// 
    [DataContract]
    public class NavigationRuntimeNode:ModelBase 
    {
        public class Comparer:IComparer<NavigationRuntimeNode> 
        {
            public static readonly Comparer Default = new Comparer();

            public int Compare(NavigationRuntimeNode x, NavigationRuntimeNode y)
            {
                return Comparer<int>.Default.Compare( x.Index .GetValueOrDefault( int.MaxValue ), y.Index.GetValueOrDefault( int.MaxValue ));
            }
        }
        public string Id
        {
            get;
            set;
        }
        public string ParentId
        {
            get;
            set;
        }
        [DataMember (Name="url")]
        public string Url
        {
            get;
            set;
        }
        [AlternateName("caption")]
        [DataMember(Name = "name")]
        public string Name
        {
            get;
            set;
        }
        [DataMember(Name = "index")]
        public int? Index { get; set; }

        [DataMember(Name = "count")]
        public int Count
        {
            get;
            set;
        }
        [AlternateName("children")]
        [DataMember(Name = "items")]
        public List<NavigationRuntimeNode> Items
        {
            get;
            set;
        }
    }
}
