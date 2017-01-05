using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Web;

namespace Mozu.SiteBuilder.UX.Admin.Helpers
{
    public class CompareHelper
    {
        public static bool AreSame<T>(T obj1, T obj2)
        {
            if (obj1 == null && obj2 == null)
                return true;

            if ((obj1 != null && obj2 == null) || (obj1 == null && obj2 != null))
                return false;

            var type = obj1.GetType();
            foreach (System.Reflection.PropertyInfo pi in type.GetProperties(System.Reflection.BindingFlags.Public | System.Reflection.BindingFlags.Instance))
            {
                object obj1Value = type.GetProperty(pi.Name).GetValue(obj1, null);
                object obj2Value = type.GetProperty(pi.Name).GetValue(obj2, null);

                if (obj1Value != obj2Value && (obj1Value == null || !obj1Value.Equals(obj2Value)))
                {
                    return false;
                }
            }

            return true;
        }
    }
}