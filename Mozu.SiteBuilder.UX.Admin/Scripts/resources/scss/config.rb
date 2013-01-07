# $ext_path: This should be the path of the Ext JS SDK relative to this file
$ext_path = "../../ext"

# environment: This defaults to :production, so we set it to :development here.
# As seen below, the production configuration is more compressed.
environment = :development

# sass_path: the directory your Sass files are in. THIS file should also be in the Sass folder
# Generally this will be in a resources/sass folder
# <root>/resources/sass
sass_path = File.dirname(__FILE__)

# sass_options: an array of options for the sass compiler.
# available options can be found at http://sass-lang.com/docs/yardoc/file.SASS_REFERENCE.html#options
sass_options = { :cache_location => ".\\tmp\\sass-cache" }

# images_path: the directory the images are in. Need to know this to create sprites.
images_path = File.join(sass_path, "..", "images")
images_dir = "../images"
http_images_dir = images_dir
relative_assets = true


# css_path: the directory you want your CSS files to be.
# Generally this is a folder in the parent directory of your Sass files
# <root>/resources/css
css_path = File.join(sass_path, "..", "css")

# include the utils rb file which has extra functionality for the ext theme
dir = File.dirname(__FILE__)
require File.join(dir, '..', 'lib', 'utils.rb') 

# register ext4 as a compass framework
Compass::Frameworks.register 'ext4', dir

# output_style: The output style for your compiled CSS
# nested, expanded, compact, compressed
# More information can be found here http://sass-lang.com/docs/yardoc/file.SASS_REFERENCE.html#output_style
output_style = (environment == :production) ? :compressed : :expanded

# We need to load in the Ext4 themes folder, which includes all it's default styling, images, variables and mixins
load File.join(File.dirname(__FILE__), $ext_path, 'resources', 'themes')
