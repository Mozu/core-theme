// -----------------------------------------------------------------------
// <copyright file="ImageUrl.cs" company="Microsoft">
// TODO: Update copyright text.
// </copyright>
// -----------------------------------------------------------------------

namespace Mozu.SiteBuilder.Mvc.Models.CMS
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Text;
    using System.Runtime.Serialization;

    /// <summary>
    /// TODO: Update summary.
    /// </summary>
    /// 
    [DataContract(Name="imageUrl")]
    public class ImageUrl
    {
        [DataMember(Name="src")]
        public string Src
        {
            get;
            set;
        }

        [DataMember(Name = "alt")]
        public string Alt
        {
            get;
            set;
        }
        [DataMember(Name = "height")]
        public int? Height
        {
            get;
            set;
        }
        [DataMember(Name = "width")]
        public int? Width
        {
            get;
            set;
        }

    }
}
