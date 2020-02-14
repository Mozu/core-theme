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
    using Microsoft.AspNetCore.Routing;

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
            var arg = this.FirstOrDefault(x => string.Equals(parameterName, x.Name, StringComparison.OrdinalIgnoreCase));

            switch (arg?.Value)
            {
                case null:
                    return defaultValue();
                case string value when string.IsNullOrEmpty(value):
                    return defaultValue();
                case T value:
                    return value;
                default:
                    try
                    {
                        return (T)Convert.ChangeType(arg.Value, typeof(T));
                    }
                    catch (Exception)
                    {
                        return defaultValue();
                    }
            }
        }

        public T GetValueOrDefault<T>(string parameterName, T defaultValue = default(T))
        {
            return GetValueOrDefault(parameterName, () => defaultValue);
        }

        public bool TryGetValue<T>(string parameterName, out T value)
        {
            var arg = this.FirstOrDefault(x => string.Equals(parameterName, x.Name, StringComparison.OrdinalIgnoreCase));
            if (arg != null)
            {
                value = (T)arg.Value;
            }
            else
            {
                value = default;
            }
            return arg != null;
        }

        public int ValueCount => this.Count(x => x.ArgumentType == TagArgument.ArgumentTypes.ValueArgument);

        public IDictionary<string, object> ToDictionary(string startKeyword = null, string endKeyword = null, IDictionary<string, object> dic = null)
        {
            //public static MvcHtmlString TextBox(this HtmlHelper htmlHelper, string name, object value, IDictionary<string, object> htmlAttributes);

            if (dic == null)
            {
                dic = new Dictionary<string, object>(StringComparer.OrdinalIgnoreCase);
            }
            var startPos = -1;
            if (startKeyword != null)
            {
                startPos = FindIndex(x => x.ArgumentType == TagArgument.ArgumentTypes.Keyword && x.Name == startKeyword);
                if (startPos == -1)
                    return dic;
            }
            var endPos = int.MaxValue;
            if (endKeyword != null)
            {
                endPos = FindIndex(x => x.ArgumentType == TagArgument.ArgumentTypes.Keyword && x.Name == endKeyword);
                if (endPos == -1)
                    endPos = int.MaxValue;
            }

            for (var pos = startPos + 1; pos < Count && pos < endPos; pos++)
            {
                dic[this[pos].Name] = this[pos].Value;
            }
            return dic;
        }

        public RouteValueDictionary ToRouteValueDictionary(string startKeyword = null, string endKeyword = null, RouteValueDictionary dic = null)
        {
            if (dic != null) return (RouteValueDictionary) ToDictionary(startKeyword, endKeyword, dic);
            dic = new RouteValueDictionary();
            dic[ArgumentCollection.ArgumentDictionaryKey ] = dic;
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
                var copy = new ArgumentCollection();
                RouteValueDictionary dic = null;
                for (var i = 0; i < coll.Count; i++)
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

                                    copy.Add(paramName != null
                                        ? new TagArgument()
                                        {
                                            Value = dic, Name = paramName,
                                            ArgumentType = TagArgument.ArgumentTypes.NamedArgument
                                        }
                                        : new TagArgument()
                                            {Value = dic, ArgumentType = TagArgument.ArgumentTypes.ValueArgument});
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
