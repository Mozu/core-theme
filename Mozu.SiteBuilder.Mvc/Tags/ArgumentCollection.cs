// -----------------------------------------------------------------------
// <copyright file="ArgumentCollection.cs" company="Microsoft">
// TODO: Update copyright text.
// </copyright>
// -----------------------------------------------------------------------

namespace Mozu.SiteBuilder.Mvc.Tags
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Text;
    using System.Web.Routing;

    /// <summary>
    /// TODO: Update summary.
    /// </summary>
    public class ArgumentCollection : List<TagArgument>
    {
        public const string ArgumentDictionaryKey = "OriginalValues";
        public string OutputVariableName { get; set; }
        public ArgumentCollection()
        { }
        public ArgumentCollection(IEnumerable<TagArgument> collection)
            : base(collection)
        { }
        public ArgumentCollection(int capacity)
            : base(capacity)
        { }

        public bool HasParamater(string parameterName)
        {
            return this.Any(x => string.Equals(parameterName, x.Name, StringComparison.OrdinalIgnoreCase));
        }
        public TagArgument this[string parameterName]
        {
            get
            {
                return this.FirstOrDefault(x => string.Equals(parameterName, x.Name, StringComparison.OrdinalIgnoreCase));
            }
        }
        public bool TryGetArgument(string parameterName, out TagArgument argument)
        {
            argument = this.FirstOrDefault(x => string.Equals(parameterName, x.Name, StringComparison.OrdinalIgnoreCase));
            return argument != null;
        }

        public T GetValueOrDefault<T>(string parameterName, Func<T> defaultValue)
        {
            TagArgument arg = this.FirstOrDefault(x => string.Equals(parameterName, x.Name, StringComparison.OrdinalIgnoreCase));

            if (arg == null || arg.Value == null) return defaultValue();
            if (arg.Value is string && string.IsNullOrEmpty((string)arg.Value)) return defaultValue();
            if (arg.Value is T) return (T)arg.Value;

            try
            {
                return (T)Convert.ChangeType(arg.Value, typeof(T));
            }
            catch (Exception)
            {
                return defaultValue();
            }

        }

        public T GetValueOrDefault<T>(string parameterName, T defaultValue = default(T))
        {
            return GetValueOrDefault(parameterName, () => defaultValue);
        }

        public bool TryGetValue<T>(string parameterName, out T value)
        {
            TagArgument arg = this.FirstOrDefault(x => string.Equals(parameterName, x.Name, StringComparison.OrdinalIgnoreCase));
            if (arg != null)
            {
                value = (T)arg.Value;
            }
            else
            {
                value = default(T);
            }
            return arg != null;
        }

        public int ValueCount
        {
            get
            {
                return this.Count(x => x.ArgumentType == TagArgument.ArgumentTypes.ValueArgument);
            }
        }

        public IDictionary<string, object> ToDictionary(string startKeyword = null, string endKeyword = null, IDictionary<string, object> dic = null)
        {
            //public static MvcHtmlString TextBox(this HtmlHelper htmlHelper, string name, object value, IDictionary<string, object> htmlAttributes);

            if (dic == null)
            {
                dic = new Dictionary<string, object>(StringComparer.OrdinalIgnoreCase);
            }
            int startPos = -1;
            if (startKeyword != null)
            {
                startPos = FindIndex(x => x.ArgumentType == TagArgument.ArgumentTypes.Keyword && x.Name == startKeyword);
                if (startPos == -1)
                    return dic;
            }
            int endPos = int.MaxValue;
            if (endKeyword != null)
            {
                endPos = FindIndex(x => x.ArgumentType == TagArgument.ArgumentTypes.Keyword && x.Name == endKeyword);
                if (endPos == -1)
                    endPos = int.MaxValue;
            }

            for (int pos = startPos + 1; pos < Count && pos < endPos; pos++)
            {
                dic[this[pos].Name] = this[pos].Value;
            }
            return dic;
        }

        public RouteValueDictionary ToRouteValueDictionary(string startKeyword = null, string endKeyword = null, RouteValueDictionary dic = null)
        {
            if (dic == null)
            {
                dic = new RouteValueDictionary();
                dic[ArgumentCollection.ArgumentDictionaryKey ] = dic;
            }
            return (RouteValueDictionary)ToDictionary(startKeyword, endKeyword, dic);
        }


        public static class Strategies
        {
            public static readonly  ArgumentCollection.ParseStrategy  MultiMapsWithOutPut = MultiMapsWithAsKeywordsFN;
            public static readonly ArgumentCollection.ParseStrategy DefaultStrategy = NullFN;


            static ArgumentCollection NullFN(ArgumentCollection coll)
            {
                return coll;
            }

            static ArgumentCollection MultiMapsWithAsKeywordsFN(ArgumentCollection coll)
            {
                ArgumentCollection copy = new ArgumentCollection();
                RouteValueDictionary dic = null;
                for (int i = 0; i < coll.Count; i++)
                {
                    var tag = coll[i];

                    if (tag.ArgumentType == TagArgument.ArgumentTypes.Keyword)
                    {
                        switch (tag.TokenValue)
                        {
                            case "as_param":
                            case "as_parameter":
                                {

                                    string paramName = null;
                                    if (i + 1 < coll.Count)
                                    {
                                        var param = coll[i];
                                        if (param.ArgumentType == TagArgument.ArgumentTypes.ValueArgument && param.Value == null)
                                        {
                                            paramName = param.TokenValue;
                                            i++;
                                        }
                                    }
                                    if (paramName != null)
                                    {
                                        copy.Add(new TagArgument() { Value = dic, Name = paramName, ArgumentType = TagArgument.ArgumentTypes.NamedArgument });
                                    }
                                    else
                                    {
                                        copy.Add(new TagArgument() { Value = dic ,  ArgumentType = TagArgument.ArgumentTypes.ValueArgument  });
                                    }
                                    dic = null;
                                    break;
                                }
                            case "as":
                                {
                                    i++;
                                    var paramName = coll[i].TokenValue;
                                    copy.OutputVariableName = paramName;
                                    break;
                                }
                            case "and":
                                {
                                    break;
                                }
                            case "with":
                                {
                                    dic = new RouteValueDictionary();
                                    dic["OriginalValues"] = dic;
                                    break;
                                }

                        }
                        continue;
                    }

                    if (dic == null)
                    {
                        copy.Add(tag);
                    }
                    else
                    {
                        dic.Add(tag.Name, tag.Value);
                    }
                }
                return copy;
            }

        }

        public delegate ArgumentCollection ParseStrategy(ArgumentCollection arg);

        public object OutputValue { get; set; }
    }

    public class TagArgument
    {
        public string Name
        {
            get;
            set;
        }
        public object Value
        {
            get;
            set;
        }
        public string TokenValue
        {
            get;
            set;
        }


        public ArgumentTypes ArgumentType
        {
            get;
            set;
        }
        public enum ArgumentTypes
        {
            ValueArgument,
            NamedArgument,
            Keyword

        }
    }


}
