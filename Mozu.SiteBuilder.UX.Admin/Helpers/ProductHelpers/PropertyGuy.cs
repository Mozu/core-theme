//using System;
//using System.Linq.Expressions;
//
//using DC = Mozu.ProductAdmin.Contracts;

//namespace Mozu.SiteBuilder.UX.Admin.Helpers.ProductHelpers
//{
//    /// <summary>
//    /// Converts object properties on a Product to a string representation of the property name.
//    /// Example: PropertyGuy.Convert(p => p.Content.ProductName) returns "content.productname".
//    /// </summary>
//    internal static class PropertyGuy
//    {
//        public static string Convert<T>(Expression<Func<DC.Product, T>> exp)
//        {
//            return ExpressionHelper.GetExpressionText(exp);
//        }
//    }
//}