

function Update-ScaleUnit-In-AppSettings ([string]$ConfigFilePath, [String] $scaleUnitId )
{
	$xml = New-Object XML
	$xml.Load($ConfigFilePath)

	$xml.configuration.appSettings.add | 
		Where-Object { $_.key -eq 'ScaleUnitId' } | 
		ForEach-Object { $_.value = [string]$scaleUnitId }

	$xml.Save($ConfigFilePath)
}

function RunAutomationTests([string]$RootPath){

	$junitFile=$RootPath +"\tests\postBuildTestResults.junit"
	$exp=$RootPath +"\Tests\Automation\phantomjs.bat http://localhost/admin/tests/index.html --exclude integration --report-format JUnit --report-file " + $junitFile
	iex $exp
	if(Test-Path $junitFile)
	{
	
		[xml]$junitReport = Get-Content $junitFile
		if ($junitReport.testsuite.errors -ne 0 -or $junitReport.testsuite.failures -ne 0  )
		{
			Write-Host $junitReport.OuterXml
			$msg = $junitReport.testsuite.errors + " Errors and "+ $junitReport.testsuite.failures + " failures occured runnit siesta tests"
			Write-Host $msg
			
			$failures=$junitReport.GetElementsByTagName("failure")
			
			foreach($failure in $failures)
			{ 
				write-host $failure.message; 
				write-host $failure.innertext;
			}
			return $false;
		
		}
		else
		{
			Write-Host "siesta tests passed"
		}
	}
	else
	{
		Write-Host "siesta tests passed"
	}

	return $true;




}

if($ScaleUnitId)
{
	$invocation = (Get-Variable MyInvocation).Value
	$directorypath = Split-Path $invocation.MyCommand.Path
	$webconfigpath = $directorypath + '\web.config'
	$binPath = $directorypath + '\bin'

	if(Test-Path $webconfigpath)
	{
		Update-ScaleUnit-In-AppSettings $webconfigpath $ScaleUnitId
	}

	$files = Get-ChildItem -Path $directorypath -Filter "*exe.config"
	foreach($file in $files)
	{
		Update-ScaleUnit-In-AppSettings $file.FullName $ScaleUnitId
	}

	if(Test-Path $binPath)
	{
		$files = Get-ChildItem -Path $binPath -Filter "*exe.config"
		foreach($file in $files)
		{
			Update-ScaleUnit-In-AppSettings $file.FullName $ScaleUnitId
		}
	}
	$automationResult = RunAutomationTests $directorypath
	if( $automationResult -eq $false)
	{
		Write-Error "test result error"
		
	}
}
