#load "packages/Mozu.BuildTools/tools/Mozu.fsx"
open Fake
open Mozu
open System

Target "mybindings" (fun _ ->
    Bindings.updateBindings Environment.CurrentDirectory
)

Target "Help" (fun _ ->
    Mozu.printHelp()
)

Target "restore" (fun _ -> 
    RestorePackages()
)

Target "build" (fun _ -> 
    let msbuildParams p = 
        {p with
            Properties = [ "configuration", "Release" 
                           "BuildingInsideVisualStudio", "true" ]
            Targets = ["Build"]
            Verbosity = Some MSBuildVerbosity.Quiet }

    build msbuildParams "Mozu.SiteBuilder.sln"
)

let testDlls = 
    !! "**/bin/Release/*UnitTest*.dll"
    ++ "**/bin/Release/*IntegrationTest*.dll"

Target "test" (fun _ ->
    let nunitParams p = 
        {NUnitDefaults with 
            Framework = "net-4.5" }
    testDlls
    |> NUnitParallel nunitParams
)
"clean" ==> "build" ==> "test"
RunTargetOrDefault "build"
