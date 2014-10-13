// -----------------------------------------------------------------------
// <copyright file="ContentServiceExtentions.cs" company="Microsoft">
// TODO: Update copyright text.
// </copyright>
// -----------------------------------------------------------------------

using System.ComponentModel;
using Mozu.SiteBuilder.UX.Models.Navigation;

namespace Mozu.SiteBuilder.Mvc.Extensions
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Text;
    using Mozu.Content.Contracts;


    public static class StringExtensions
    {
        public static string GetNullIfWhiteSpace(this string val)
        {
            if (string.IsNullOrWhiteSpace(val))
            {
                return null;
            }
            return val;
        }
        public static string GetNullIfEmpty(this string val)
        {
            if (string.IsNullOrEmpty( val))
            {
                return null;
            }
            return val;
        }

        private static readonly string[] SpecialCharacters = { "^", "'", "\"", "{", "}", "(", ")", "[", "]" };
        public static string ToFilterSafeString(this string inputString)
        {
            return SpecialCharacters.Aggregate(inputString, (s, spec) => s.Replace(spec, "^" + spec));
        }
    }

    /// <summary>
    /// TODO: Update summary.
    /// </summary>
    
}
