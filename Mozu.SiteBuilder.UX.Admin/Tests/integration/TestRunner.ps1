param([string] $testEnv='si', [string] $localhostPrefix='sb', [int] $tenantId=-1, [string] $testScript='admin-integration-tests.js', [switch] $verbose)

$testOrch = Get-ChildItem -Path ..\..\..\packages\Mozu.VS.PowerShell.*\tools\TestOrchestrator.psm1

if ($testOrch -eq $null) {
    Throw "Can't find TestOrchestrator.psm1"
}

Write-Verbose ($testOrch.FullName)

Import-Module ($testOrch.FullName)

if ($verbose -eq $true) {
    Test-MozuJs -testEnv $testEnv -localhostPrefix $localhostPrefix -tenantId $tenantId -testScript $testScript -setupEnv $false -verbose
}
else {
    Test-MozuJs -testEnv $testEnv -localhostPrefix $localhostPrefix -tenantId $tenantId -testScript $testScript -setupEnv $false
}