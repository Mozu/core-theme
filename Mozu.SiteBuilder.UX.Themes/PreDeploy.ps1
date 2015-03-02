function get-web-vdir($vdirName)
{
    $found = $false
    if(test-path iis:)
    {
        cd IIS:\sites
        $sites = dir 
        pushd
        foreach($site in $sites)
        {
            cd $site.name
            $vdirs = dir
            foreach($vdir in $vdirs)
            {
               if(($vdir.NodeType -eq "virtualDirectory")-and ($vdir.Name -eq $vdirName))
               {
                 $found = $true, ($vdir.name), ($vdir.PhysicalPath)
               } 
            }
        }
        popd
    }
    return $found
}


function CreateVirtualDir(
    [string] $virtualDir,
	[string] $virtualDirPhysicalPath,
    [string] $siteName)
{
    New-WebVirtualDirectory -name $virtualDir -PhysicalPath $virtualDirPhysicalPath -Site $sitename -Force 
}

$result = get-web-vdir "themes"
	if($result[0] -eq $true)
	{ 
		Write-host "Themes directory is already in place" 
	}
	else{ 
		if(test-path "D:\mozu\Sites\SiteBuilder\themes")
		{CreateVirtualDir "Themes" "D:\mozu\Sites\SiteBuilder\themes" "SiteBuilder"}
		else
		{
			md "D:\mozu\Sites\SiteBuilder\themes"
			CreateVirtualDir "Themes" "D:\mozu\Sites\SiteBuilder\themes" "SiteBuilder"
		}
	}

