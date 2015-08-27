// -----------------------------------------------------------------------
// <copyright file="TypeExtensions.cs" company="Microsoft">
// TODO: Update copyright text.
// </copyright>
// -----------------------------------------------------------------------

namespace Mozu.SiteBuilder.Mvc.Extensions
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Text;
    using System.Reflection;

    /// <summary>
    /// TODO: Update summary.
    /// </summary>
    public static class TypeExtentions
    {
        public static bool IsAssignableFrom2( this Type type , Type destinationType )
        {
            if (type.IsAssignableFrom(destinationType))
            {
                return true;
            }
            return type.ImplicitlyConvertsTo(destinationType);
        }
        public static bool ImplicitlyConvertsTo(this Type type, Type destinationType)
        {

            if (type == destinationType)
                return true;


            return (from method in type.GetMethods(BindingFlags.Static |
                                                   BindingFlags.Public)
                    where method.Name == "op_Implicit" &&
                          method.ReturnType == destinationType
                    select method
                    ).Count() > 0;
        }
    }
}
