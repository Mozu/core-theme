
rd /s /q .\built
mkdir built
node .\node_modules\jsdoc\jsdoc.js -c jsdoc_conf.json
if %1==host static ./built