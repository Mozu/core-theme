#load "packages/Mozu.BuildTools/tools/Mozu.fsx"
open Fake
open Mozu
open System

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

Target "help" (fun _ ->
    printfn "Targets"
    printfn "-------"
    printfn "cs         build the app"
    printfn "js         build the app and do npm builds"
    printfn "test       run the tests. can specify 'siesta' to just do siesta tests"
    printfn "-------"
    printfn "Arguments"
    printfn "-------"
    printfn "release    build/test in release instead of debug"
)

"clean" ==> "cs"

RunTargetOrDefault "help"