#I "packages/FAKE/tools"
#r "FakeLib"
#load "Xml.fsx"

open Fake

// build constants
let config = match hasBuildParam "release" with true -> "Release" | false -> "Debug"
let builtins = [
  "Mozu.SiteBuilder.UX/BuiltInScripts/SDK"
  "Mozu.SiteBuilder.UX/BuiltInScripts/HyprLive"
  "Mozu.SiteBuilder.UX/BuiltInScripts/RequireJS"
]

let themes = [
  "Mozu.SiteBuilder.UX.Themes/Themes/Core4"
  "Mozu.SiteBuilder.UX.Themes/Themes/Core5"
  "Mozu.SiteBuilder.UX.Themes/Themes/Core6"
  "Mozu.SiteBuilder.UX.Themes/Themes/Core7"
  "Mozu.SiteBuilder.UX.Themes/Themes/Core8"
  "Mozu.SiteBuilder.UX.Themes/Themes/Core9"
]

let npm = findFile pathDirectories "npm.cmd"
let grunt = findFile pathDirectories "grunt.cmd"
let adminScripts = __SOURCE_DIRECTORY__ </> "Mozu.SiteBuilder.UX.Admin" </> "Scripts";
let makeTfsBuild = Fake.ProcessHelper.findFile [adminScripts] "makeTfsBuild.bat"
let sencha = findFile pathDirectories "sencha.exe"
// targets

Target "clean" (fun _ ->
    !! "**/bin/*"
    ++ "**/obj/*"
    -- "packages/**"
    -- "lib/**"
    |> DeleteDirs
)

Target "cs" (fun _ ->
  let buildParams p : MSBuildParams =
      {p with Properties = [ "configuration", config
                             "BuildingInsideVisualStudio", "false" ]
              Verbosity = Some MSBuildVerbosity.Quiet }

  build buildParams "Mozu.SiteBuilder.sln"
)

let npmAndGrunt workDir =
  let npmResult = Shell.Exec(npm, "install", workDir)
  match npmResult with
  | 0 -> Shell.Exec(grunt, "-v", workDir)
  | n -> n
let senchaBuild adminScriptsdir =
  DeleteDirs [adminScriptsdir </> ".." </> "build"]
  DeleteFiles [adminScriptsdir </> "bootstrap.js"; adminScriptsdir </> "bootstrap.json"]
  match Shell.Exec(sencha, "app build -c", adminScriptsdir) with
  | 0 ->
    match Shell.Exec(sencha, "ant testing js", adminScriptsdir) with
    | 0 ->
      let testDir = adminScriptsdir</>".."</>"Tests"
      Shell.Exec (testDir</>"admintests.bat", "", testDir)
    | n -> n
  | n -> n


Target "js" (fun _ ->
  for builtin in builtins do
    match __SOURCE_DIRECTORY__ + "/" + builtin |> npmAndGrunt with
    | 0 -> ()
    | n -> failwithf "error running grunt and npm for %s" builtin

  for theme in themes do
    match __SOURCE_DIRECTORY__ + "/" + theme |> npmAndGrunt with
    | 0 -> logfn "no problem with %s" theme
    | n -> failwithf "error running grunt and npm for %s" theme
  // build ext. cheating here by calling the existing sencha batch file instead of sencha directly
  match senchaBuild adminScripts with
  | 0 -> ()
  | n  -> failwithf "sencha failed with code %d" n
)

let testDlls =
    !! (sprintf "**/bin/%s/*UnitTest*.dll" config)
    ++ (sprintf "**/bin/%s/*IntegrationTest*.dll" config)

let test() =
  let nunitParams p =
      {NUnitDefaults with
          Framework = "net-4.5"
          IncludeCategory = match hasBuildParam "siesta" with true -> "Siesta" | false -> "" }
  testDlls
  |> NUnit nunitParams

Target "test" (fun _ ->
  test()
)

Target "set-env" (fun _ ->
    let env = getBuildParamOrDefault "env" "CI"
    let scaleUnit = getBuildParamOrDefault "su" "SB"
    Xml.updateUserConfig env scaleUnit
)

Target "help" (fun _ ->
    printfn "Targets"
    printfn "-------"
    printfn "cs         build the app"
    printfn "js         build builtinscripts, ext, and themes"
    printfn "test       run the tests. can specify 'siesta' to just do siesta tests"
    printfn "set-env [env=ENV] [su=SCALEUNIT]     creates a local override for the web.configs"
    printfn "-------"
    printfn "Arguments"
    printfn "-------"
    printfn "release    build/test in release instead of debug"
)

"clean" ==> "cs"

RunTargetOrDefault "help"
