using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.FSharp.Collections;

namespace Mozu.SiteBuilder.Mvc.Extensions
{
    public static class FSharpExtensions
    {
        public static FSharpList<T> ToFSharpList<T>(this IEnumerable<T> input)
        {
            //todo make defered
            return CreateFSharpList(input.ToList(), 0);
        }


        public static FSharpList<T> ToFSharpList<T>(this IList<T> input)
        {
            return CreateFSharpList(input, 0);
        }

        private static FSharpList<T> CreateFSharpList<T>(IList<T> input, int index)
        {
            if (index >= input.Count)
            {
                return FSharpList<T>.Empty;
            }
            else
            {
                return FSharpList<T>.Cons(input[index], CreateFSharpList(input, index + 1));
            }
        }

    }
}
