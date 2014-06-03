
if not exist C:\sitebuilder\devstuff\ExtVersions\ext-4.2.2.1144 (
	echo "missing C:\sitebuilder\devstuff\ExtVersions\ext-4.2.2.1144  get from $/Mozu/UI/Dev/LocalDevStuff/ExtVersions/ext-4.2.2.1144"
	EXIT /B
)




if exist .sencha\workspace (
    attrib -r build/*.* /S
	attrib -r bootstrap.js
	attrib -r bootstrap.json
	sencha app build -c
	sencha ant testing js
) else (
   
	sencha --sdk C:\sitebuilder\devstuff\ExtVersions\ext-4.2.2.1144 generate workspace .

	attrib -r build/*.* /S
	attrib -r bootstrap.js
	attrib -r bootstrap.json
	sencha app build -c
	sencha ant testing js
)