using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;

namespace Mozu.SiteBuilder.UX.Models.Navigation
{
    [DataContract]
    public class RedirectEntry
    {
        
        [DataMember(Name = "s", EmitDefaultValue = false, IsRequired = true, Order = 0)]
        public string Source { get; set; }

        [DataMember(Name = "d", EmitDefaultValue = false, IsRequired = true, Order = 1)]
        public string Destination { get; set; }

        [DataMember(Name = "rw", EmitDefaultValue = false, IsRequired = false, Order = 2)]
        public bool? IsRewrite { get; set; }

         [DataMember(Name = "t", EmitDefaultValue = false, IsRequired = false, Order = 3)]
        public bool? IsTemporary { get; set; }
         [DataMember(Name = "q", EmitDefaultValue = false, IsRequired = false, Order = 4)]
        public bool? CopyQueryString { get; set; }

        [DataMember(Name = "p", EmitDefaultValue = false, IsRequired = false, Order = 5)]
        public decimal? Priority { get; set; }

        [DataMember(Name = "e", EmitDefaultValue = false, IsRequired = false, Order = 6)]
        public bool? IsEnabled { get; set; }
    }

    public class RedirectComparer : IComparer<RedirectEntry>
    {
        public static RedirectComparer Default = new RedirectComparer();
        private RedirectComparer() { }
        public int Compare(RedirectEntry x, RedirectEntry y)
        {
            if (x == null && y == null)
            {
                return 0;
            }
            if (x == null)
            {
                return -1;
            }
            if (y == null)
            {
                return 1;
            }


            var xQPos = x.Source.IndexOf('?');
            var yQPos = y.Source.IndexOf('?');
            var xStem = xQPos == -1 ? x.Source : x.Source.Substring(0, xQPos);
            var yStem = yQPos == -1 ? y.Source : y.Source.Substring(0, yQPos);

            var ret = StringComparer.OrdinalIgnoreCase.Compare(xStem, yStem);
            if (ret != 0)
            {
                return ret;
            }



            if (!x.Priority.HasValue && y.Priority.HasValue && y.Priority != 0)
            {
                return y.Priority.Value > 0 ? 1 : -1;
            }
            if (!y.Priority.HasValue && x.Priority.HasValue && x.Priority != 0)
            {
                return x.Priority.Value > 0 ? -1 : 1;
            }
            if (x.Priority.HasValue && y.Priority.HasValue && x.Priority.Value != y.Priority.Value)
            {
                return x.Priority.Value - y.Priority.Value > 0 ? -1 : 1;
            }

            var xQ = System.Web.HttpUtility.ParseQueryString((xQPos != -1 ? x.Source.Substring(xQPos) : ""));
            var yQ = System.Web.HttpUtility.ParseQueryString((yQPos != -1 ? y.Source.Substring(yQPos) : ""));
            var xCount = xQ.AllKeys.Aggregate(0, (cnt, k) => xQ[k] == "*" ? cnt + 1 : cnt);
            var yCount = yQ.AllKeys.Aggregate(0, (cnt, k) => yQ[k] == "*" ? cnt + 1 : cnt);
            if (xCount != yCount)
            {
                return xCount - yCount > 0 ? 1 : -1;
            }
            return xQ.Count - yQ.Count > 0 ? -1 : 1;
        }


    }


    public class RedirectFormats
    {
        [DataMember(Name = "format", EmitDefaultValue = false, IsRequired = false, Order = 1)]
        public string Format { get; set; }

        [DataMember(Name = "entityType", EmitDefaultValue = false, IsRequired = false, Order = 1)]
        public string EntityType { get; set; }

    }

    public enum PageTypes
    {
        documentList,
        documentListView,
        document
    }
}
