# Morrissey
#### a superfluous blight on Mozu theme development

Morrissey does three common Mozu theme building tasks:

 - It *compiles AMD JavaScript modules*, respecting the inheritance you've specified. That means that it compiles across the logical theme hierarchy to make a single set of built scripts incorporating all inherited scripts. It looks for R.JS options in a file /MetaData/build.js
 - It *removes unnecessary files*. Chances are you created your theme by copying another theme, probably the theme from which you intend to inherit. So you copied the entire theme, including files you have no intention of changing. Morrissey can remove those files, thus helping you to rely on the theme inheritance hierarchy.
 - It *autogenerates your theme.xml* file. You heard that right. It **creates a small XML file based on user input.** You're welcome.

Soon, it will interact with Dev Center and watch directories for you. This will make it a charming man instead of half a person.

## Usage

Morrissey works on the command line anywhere Node.js works, so that includes Windows, OSX, and most unices. It doesn't do any of the above things by default! Use `--build-js`, `--remove-untouched-files`, and `--autogenerate-theme-settings` or their shortcuts, which you can find by running `morrissey --help`.


####Credits
&copy; Volusion 2013 James Zetlen etc. all rights reserved confidential.