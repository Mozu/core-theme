#load "packages/Mozu.BuildTools/tools/Mozu.fsx"
open Fake
open Mozu
open System
open System.IO
open System.Xml
open System.Xml.XPath
open System.Xml.Linq

Target "mybindings" (fun _ ->
    Bindings.updateBindings Environment.CurrentDirectory
)

Target "clean" (fun _ ->
    !! "**/bin/*"
    ++ "**/obj/*"
    -- "packages/**"
    -- "**/node_modules/**"
    -- "lib/**"
    -- "**/Scripts/**"
    |> DeleteDirs
)

Target "restore" (fun _ ->
    RestorePackages()
)

let config = match hasBuildParam "release" with true -> "Release" | false -> "Debug"

let build inVS =
    let buildParams p : MSBuildParams =
        {p with Properties = [ "configuration", config
                               "BuildingInsideVisualStudio", inVS |> string ]
                Verbosity = Some MSBuildVerbosity.Quiet }

    build buildParams "Mozu.SiteBuilder.sln"

Target "cs" (fun _ ->
    build true
)

Target "js" (fun _ ->
    // TODO: make this actually run sencha/npm/etc
    build false
)

let testDlls =
    !! (sprintf "**/bin/%s/*UnitTest*.dll" config)
    ++ (sprintf "**/bin/%s/*IntegrationTest*.dll" config)

Target "test" (fun _ ->

    let nunitParams p =
        {NUnitDefaults with
            Framework = "net-4.5"
            IncludeCategory = match hasBuildParam "siesta" with true -> "Siesta" | false -> "" }
    testDlls
    |> NUnit nunitParams
)

let createDefaultconfig filePath =
  File.WriteAllText(filePath, """<?xml version="1.0" encoding="utf-8"?>
  <configuration>
  <appSettings>
  <add key="Environment" value=""/>
  <add key="ScaleUnit" value=""/>
  </appSettings>
  </configuration>
""")

let xname s = XName.op_Implicit s
let attr name (xElem:XElement) = xElem.Attribute(xname name)

let updateAppSetting (key:string) (value:string) (doc : XDocument) =
  let config = doc.Descendants(xname "configuration")  |> Seq.head
  let appSettings  = config.Descendants(xname "appSettings") |> Seq.head
  let add = appSettings.Descendants() |> Seq.find (fun add -> (add |> attr "key").Value = key)
  let atr = add |> attr "value"
  atr.Value <- value

let updateUserConfig env su =
  let filePath = Path.Combine("C:/code/sitebuilder", "user.app.config")
  if not <| File.Exists(filePath)
  then
    createDefaultconfig filePath

  let doc = XDocument.Load(filePath)
  updateAppSetting "Environment" env doc
  updateAppSetting "ScaleUnit" su doc
  doc.Save(filePath)

Target "set-env" (fun _ ->
    let env = getBuildParamOrDefault "env" "CI"
    let scaleUnit = getBuildParamOrDefault "su" "SB"
    updateUserConfig env scaleUnit
)

Target "help" (fun _ ->
    printfn "Targets"
    printfn "-------"
    printfn "cs         build the app"
    printfn "js         build the app and do npm builds"
    printfn "test       run the tests. can specify 'siesta' to just do siesta tests"
    printfn "set-env [env=ENV] [su=SCALEUNIT]     creates a local override for the web.configs"
    printfn "-------"
    printfn "Arguments"
    printfn "-------"
    printfn "release    build/test in release instead of debug"
)

"clean" ==> "cs"

RunTargetOrDefault "help"
