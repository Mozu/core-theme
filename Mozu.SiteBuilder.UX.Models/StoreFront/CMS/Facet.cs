// -----------------------------------------------------------------------
// <copyright file="Facet.cs" company="Microsoft">
// TODO: Update copyright text.
// </copyright>
// -----------------------------------------------------------------------

namespace Mozu.SiteBuilder.Mvc.Models.CMS
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Text;

    /// <summary>
    /// TODO: Update summary.
    /// </summary>
    public class Facet
    {

        public int count { get { return Count; } }
        public string name { get { return Name; } }
        public int Count { get; set; }
        public string Name { get; set; }
    }
}
