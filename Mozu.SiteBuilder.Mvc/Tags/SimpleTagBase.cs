using System.Text.RegularExpressions;
using System.Threading.Tasks;
using FSharpx.Collections;
using Microsoft.FSharp.Core;
using NDjango;
using Newtonsoft.Json.Linq;

namespace Mozu.SiteBuilder.Mvc.Tags
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using NDjango.Interfaces;
    
    public interface IHyprNode
    {
        Walker Walk(ITemplateManager manager, Walker walker);
    }
 
    /// <summary>
    /// TODO: Update summary.
    /// </summary>
    public abstract class SimpleTagBase : ITag
    {
        public Tuple<INodeImpl, IParsingContext, LazyList<Lexer.Token>> Perform(Lexer.BlockToken blockToken, IParsingContext parsingContext, LazyList<Lexer.Token> tokenList)
        {
            var blockTokenArs = PreProcessArguments(blockToken.Args);
            ParamFilters = blockTokenArs.Select(x => new Expressions.FilterExpression(parsingContext, x));
            
            var nodeImpl = new TagNodeImpl(parsingContext, blockToken, this);
            var resp = new PerformRespnose(nodeImpl, parsingContext, tokenList);
            return resp;
        }

        public IEnumerable<Expressions.FilterExpression> ParamFilters { get; set; }
        
        static readonly string[] Keywords = { "as", "with", "as_param", "as_parameter" , "and"};
        string[] _keywords = (string[])Keywords.Clone();

        public string[] KeyWords
        {
            get { return _keywords; }
            set { _keywords = value; }
        }

        protected virtual IEnumerable<Lexer.TextToken> PreProcessArguments(IEnumerable<Lexer.TextToken> tokens)
        {
            return tokens;
        }

        protected abstract void  ProcessTag(ArgumentCollection arguments, ref  IContext context , out string buffer , out string templateName );

        protected virtual ArgumentCollection.ParseStrategy ArgumentParserStrategy { get; set; }
        
        class TagNodeImpl : ParserNodes.TagNode, IHyprNode
        {
            public SimpleTagBase TagBase { get { return (SimpleTagBase)Tag; } }

            public TagNodeImpl(IParsingContext parsingContext, Lexer.BlockToken blockToken, SimpleTagBase tag) : base(parsingContext, blockToken, tag)
            {
                _blockToken = blockToken;
                _parsingContext = parsingContext;
            }

            readonly IParsingContext _parsingContext;
            readonly Lexer.BlockToken _blockToken;

            public override Walker walk(ITemplateManager manager, Walker walker)
            {
                var arguments = ProcessArguments(walker);
                if (TagBase.ArgumentParserStrategy != null)
                {
                    arguments = TagBase.ArgumentParserStrategy(arguments);
                }
                var ctx = walker.context;
                
                string buffer;
                string templateName;
                TagBase.ProcessTag(arguments, ref ctx, out buffer, out templateName);
                if (arguments.OutputVariableName != null)
                {
                    if (arguments.OutputValue == null)
                    {
                        arguments.OutputValue = buffer;
                        buffer = string.Empty;
                    }
                    ctx = ctx.add(new Tuple<string, object>(arguments.OutputVariableName, arguments.OutputValue));
                }
                bool walked = false;
                if (!string.IsNullOrEmpty(buffer))
                {
                    buffer = string.IsNullOrEmpty(walker.buffer) ? buffer : walker.buffer + buffer;
                    walker = new Walker(walker.parent, walker.nodes, buffer, walker.bufferIndex, ctx);
                    walker = TagBase.Walk(arguments, ctx, manager, walker, this);
                    walked = true;
                }
                if (!string.IsNullOrEmpty(templateName))
                {
                    ITemplate template;
                    try
                    {
                       template =  manager.GetTemplate(templateName);
                    }
                    catch (Exception  ex )
                    {
                        throw new RenderingException(ex.Message, Token, null);

                    }
                    
                    walker = new Walker(new FSharpOption<Walker>(walker), template.Nodes, walker.buffer, walker.bufferIndex, ctx);
                    walker = TagBase.Walk(arguments, ctx, manager, walker, this);
                    walked = true;
                    
                }
                if (!walked)
                {
                    walker = TagBase.Walk(arguments, ctx, manager, walker, this);
                }
                return walker;
            }

            static readonly string[] EmptyStringArray = new string[0];
            private ArgumentCollection ProcessArguments(Walker walker)
            {
                var arguments = new ArgumentCollection();
                var kwords = ((SimpleTagBase)Tag).KeyWords ?? EmptyStringArray;
                arguments.AddRange(_blockToken.Args.Select(arg => GenerateTagArgument(walker, arg, kwords)));
                return arguments;
            }

            private TagArgument GenerateTagArgument(Walker walker, Lexer.TextToken arg, IEnumerable<string> kwords)
            {
                var tagArg = new TagArgument
                {
                    TokenValue = arg.Value
                };

                if (IsKeyword(kwords, arg.Value)) // is keyword
                {
                    tagArg.Name = arg.Value;
                    tagArg.ArgumentType = TagArgument.ArgumentTypes.Keyword;
                }
                else if (ContainsNamedParameters(arg.Value)) // is a named expression
                {
                    var nameValueParts = GetNameValueParts(arg.Value);
                    tagArg.ArgumentType = TagArgument.ArgumentTypes.NamedArgument;
                    tagArg.Name = nameValueParts.Item1;
                    tagArg.Value =
                        new Expressions.FilterExpression(_parsingContext, arg.WithValue(nameValueParts.Item2, null)).Resolve(
                            walker.context, true).Item1.Value;
                }
                else // is just a value
                {
                    tagArg.ArgumentType = TagArgument.ArgumentTypes.ValueArgument;
                    tagArg.Name = "na";
                    tagArg.Value = new Expressions.FilterExpression(_parsingContext, arg).Resolve(walker.context, true).Item1.Value;
                }

                var jarr = tagArg.Value as JArray;
                var jval = tagArg.Value as JValue;
                if (jval != null)
                {
                    tagArg.Value = jval.Value;
                }
                else if (jarr != null)
                {
                    tagArg.Value = jarr.Cast<object>().ToList();
                    //todo turn into some type of colletion or array.
                }

                return tagArg;
            }

            private static Tuple<string,string> GetNameValueParts(string value)
            {
                var matches = QuotedText.Matches(value);
                if (matches.Cast<Match>().All(x => !x.Success)) // if there's no quoted text
                {
                    var splits = value.Split('=');                          // then if there are any (=) we must have a named arg
                    return new Tuple<string, string>(splits[0], splits[1]);
                }

                var ss = 
                    matches.Cast<Match>()
                    .Aggregate(value, ReplaceString) // sub out the matches with * in the string
                    .Split('='); // fish out the name and arg parts
                
                return 
                    matches.Cast<Match>()
                    .Aggregate(new Tuple<string, string>(ss[0], ss[1]), ReplaceNameOrArg); // now put the match data back in the string
            }

            /// <summary>
            /// subs out from a string with * chars the chunk that was matched.
            /// </summary>
            /// <param name="current"></param>
            /// <param name="match"></param>
            /// <returns></returns>
            private static string ReplaceString(string current, Capture match)
            {
                return current.Substring(0, match.Index) + new string('*', match.Length) + current.Substring(match.Index + match.Length +1);
            }

            /// <summary>
            /// replaces the * in a string with the matching value from the match
            /// </summary>
            /// <param name="p"></param>
            /// <param name="match"></param>
            /// <returns></returns>
            private static Tuple<string, string> ReplaceNameOrArg(Tuple<string, string> p, Capture match)
            {
                if (match.Index < p.Item1.Length)
                {
                    var nameReplace = ReplaceWithMatch(p.Item1, match.Value);
                    return new Tuple<string, string>(nameReplace, p.Item2);
                }

                var argReplace = ReplaceWithMatch(p.Item2, match.Value);
                return new Tuple<string, string>(p.Item1, argReplace);
            }

            private static string ReplaceWithMatch(string init, string replace)
            {
                return init.Replace(new string('*', replace.Length), replace);
            }

            private static bool IsKeyword(IEnumerable<string> keywords, string blockTokenArg)
            {
                return keywords.Contains(blockTokenArg);
            }

            private static readonly Regex QuotedText = new Regex(@"(?:""(?:[^""\\]*(?:\\.[^""]*)*)""|'(?:[^'\\]*(?:\\.[^']*)*)')", RegexOptions.Compiled);

            /// <summary>
            /// This is a named parameter if there is an assignment (=) that's not in quotes anywhere in the arg.
            /// </summary>
            /// <param name="blockTokenArg"></param>
            /// <returns></returns>
            private static bool ContainsNamedParameters(string blockTokenArg)
            {
                var matches = QuotedText.Matches(blockTokenArg);
                if (matches.Cast<Match>().All(x => !x.Success))                     // if there's no quoted text
                    return blockTokenArg.Contains("="); // then if there are any (=) we must have a named arg
                
                // if there are quoted args, we have to strip each of those matches from the original string and then see if any (=) remain in the string.
                var replacedString = 
                    matches.Cast<Match>()
                    .Aggregate(blockTokenArg, (current, match) => current.Replace(match.Value, string.Empty));

                return replacedString.Contains("=");
            }

            Walker IHyprNode.Walk(ITemplateManager templateManager, Walker walker)
            {
                return base.walk( templateManager, walker);
            }
        }

        public virtual bool is_header_tag { get; set; }

        public class PerformRespnose : Tuple<INodeImpl, IParsingContext, LazyList<Lexer.Token>>
        {
            public PerformRespnose(INodeImpl nodeImpl, IParsingContext parseContext, LazyList<Lexer.Token> tokenList) : base(nodeImpl, parseContext, tokenList) { }
        }

        protected virtual Walker Walk(ArgumentCollection arguments, IContext context, ITemplateManager templateManager, Walker walker, IHyprNode tagNode)
        {
            return tagNode.Walk( templateManager, walker); 
        }
    }
    
    public abstract class SimpleTagBaseAsync : ITag
    {
        public Tuple<INodeImpl, IParsingContext, LazyList<Lexer.Token>> Perform(Lexer.BlockToken blockToken, IParsingContext parsingContext, LazyList<Lexer.Token> tokenList)
        {
            var blockTokenArs = PreProcessArguments(blockToken.Args);
            ParamFilters = blockTokenArs.Select(x => new Expressions.FilterExpression(parsingContext, x));
            
            var nodeImpl = new TagNodeImplAsync(parsingContext, blockToken, this);
            var resp = new PerformRespnose(nodeImpl, parsingContext, tokenList);
            return resp;

        }

        public class ProcessTagResult
        {
            public ProcessTagResult(IContext context)
            {
                Context = context;
            }
            public string Template { get; set; }
            public string Buffer { get; set; }
            public IContext Context { get; set; }
        }

        static readonly string[] Keywords = { "as", "with", "as_param", "as_parameter", "and" };
        string[] _keywords = Keywords;

        public string[] KeyWords
        {
            get { return _keywords; }
            set { _keywords = value; }
        }

        protected virtual IEnumerable<Lexer.TextToken> PreProcessArguments(IEnumerable<Lexer.TextToken> tokens)
        {
            return tokens;
        }

        protected virtual ArgumentCollection.ParseStrategy ArgumentParserStrategy { get; set; }
        IEnumerable<Expressions.FilterExpression> ParamFilters;

        class TagNodeImplAsync : ParserNodes.TagNode, IHyprNode, INodeImplAsync
        {

            public SimpleTagBaseAsync TagBase
            {
                get { return (SimpleTagBaseAsync)Tag; }
            }

            public TagNodeImplAsync(IParsingContext parsingContext, Lexer.BlockToken blockToken, SimpleTagBaseAsync tag)
                : base(parsingContext, blockToken, tag)
            {
                _blockToken = blockToken;
                _parsingContext = parsingContext;
            }

            readonly IParsingContext _parsingContext;
            readonly Lexer.BlockToken _blockToken;


            public async Task<Walker> asyncWalk(ITemplateManager manager, Walker walker)
            {
                var arguments = ProcessArguments(walker);
                if (TagBase.ArgumentParserStrategy != null)
                {
                    arguments = TagBase.ArgumentParserStrategy(arguments);
                }
                var ctx = walker.context;
                
                var result = await TagBase.ProcessTagAsync(arguments, ctx).ConfigureAwait(false);
                var buffer = result.Buffer;
                var templateName = result.Template;
                ctx = result.Context;
                if (arguments.OutputVariableName != null)
                {
                    if (arguments.OutputValue == null)
                    {
                        arguments.OutputValue = buffer;
                        buffer = string.Empty;
                    }
                    ctx = ctx.add(new Tuple<string, object>(arguments.OutputVariableName, arguments.OutputValue));
                }
                var walked = false;
                if (!string.IsNullOrEmpty(buffer))
                {
                    buffer = string.IsNullOrEmpty(walker.buffer) ? buffer : walker.buffer + buffer;
                    walker = new Walker(walker.parent, walker.nodes, buffer, walker.bufferIndex, ctx);
                    walker = TagBase.Walk(arguments, ctx, manager, walker, this);
                    walked = true;
                }
                if (!string.IsNullOrEmpty(templateName))
                {
                    ITemplate template;
                    try
                    {
                        template = manager.GetTemplate(templateName);
                    }
                    catch (Exception ex)
                    {
                        throw new RenderingException(ex.Message, Token, null);
                    }

                    walker = new Walker(new FSharpOption<Walker>(walker), template.Nodes, walker.buffer, walker.bufferIndex, ctx);
                    walker = TagBase.Walk(arguments, ctx, manager, walker, this);
                    walked = true;

                }
                if (!walked)
                {
                    walker = TagBase.Walk(arguments, ctx, manager, walker, this);
                }
                return walker;
            }

            public override Walker walk(ITemplateManager manager, Walker walker)
            {
                var res = asyncWalk(manager, walker).ConfigureAwait(false).GetAwaiter().GetResult();
                return res;
            }

            static readonly string[] EmptyStringArray = new string[0];
            private ArgumentCollection ProcessArguments(Walker walker)
            {
                var arguments = new ArgumentCollection();
                var kwords = ((SimpleTagBaseAsync )Tag).KeyWords ?? EmptyStringArray;
                foreach (var arg in _blockToken.Args)
                {
                    var tagArg = new TagArgument
                    {
                        TokenValue = arg.Value
                    };

                    var idx = Array.IndexOf(kwords, arg.Value);
                    if (idx > -1)
                    {
                        tagArg.Name = arg.Value;
                        tagArg.ArgumentType = TagArgument.ArgumentTypes.Keyword;
                    }
                    else if (arg.Value.Contains("="))
                    {
                        var parts = arg.Value.Split('=');
                        tagArg.ArgumentType = TagArgument.ArgumentTypes.NamedArgument;
                        tagArg.Name = parts[0];
                        tagArg.Value = new Expressions.FilterExpression(_parsingContext, arg.WithValue(parts[1], null)).Resolve(walker.context, true).Item1.Value;
                    }
                    else
                    {
                        tagArg.ArgumentType = TagArgument.ArgumentTypes.ValueArgument;
                        tagArg.Name = "na";
                        tagArg.Value = new Expressions.FilterExpression(_parsingContext, arg).Resolve(walker.context, true).Item1.Value;
                    }
                    var jarr = tagArg.Value as JArray;
                    var jval = tagArg.Value as JValue;
                    if (jval != null)
                    {
                        tagArg.Value = jval.Value;
                    }
                    else if (jarr != null)
                    {
                        tagArg.Value = jarr.Cast<object>().ToList();
                    }
                    arguments.Add(tagArg);
                }
                return arguments;
            }

            Walker IHyprNode.Walk(ITemplateManager templateManager, Walker walker)
            {
                return base.walk(templateManager, walker);
            }
        }

        public virtual bool is_header_tag { get; set; }

        public class PerformRespnose : Tuple<INodeImpl, IParsingContext, LazyList<Lexer.Token>>
        {
            public PerformRespnose(INodeImpl nodeImpl, IParsingContext parseContext, LazyList<Lexer.Token> tokenList) : base(nodeImpl, parseContext, tokenList){ }
        }
        
        protected virtual Walker Walk(ArgumentCollection arguments, IContext context, ITemplateManager templateManager, Walker walker, IHyprNode tagNode)
        {
            return tagNode.Walk(templateManager, walker);
        }
        
        protected abstract Task<ProcessTagResult> ProcessTagAsync(ArgumentCollection arguments,  IContext ctx);
    }
}
