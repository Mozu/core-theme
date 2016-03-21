# Caliente - Mozu Layouts & Widgets

## About

Caliente is built of a few UI-Components and Utilities

### UI-Components

1. Grid (A Dropzone)
2. Row (A Container for Columns)
3. Column (A Container for Rows, Columns and Blocks)
4. Block (A Container for Widgets)

### Utilities

1. Editor
2. Utilities 
3. Utilities/Factory 
4. Widgets


## UI-Components Explained

### Grid

A Grid is a tiny class which is generated once per dropzone. If a page has two dropzones defined in the theme, then two Grids will be generated no matter how many columns, rows, or widgets are contained in the dropzone.

### Row

A Row is a container that holds columns. When initialized, it creates a header with an edit and delete action. Rows cannot be resized or dragged. Rows do not have a `drop` event, but do generate `hint` events.

### Column

The Caliente Column is where much of the core logic is built. All drop events occur on columns. It is the columns job to evaluate where a drop occurs, and what time of widget/layout should be generated based on the action. Columns (unlike rows) can contain rows, columns, and widgets, can be (theoretically) infinetly nested.

Columns are responsible for:

1. Managing Drag Widths
2. Managing `mz-cms-span-gridSpan` classes
3. Managing Drop and Hint Events
4. Manage dragging Columns from one layout to another

### Block

The Block is very simple, and is only a container for widgets. Blocks spin up a header, and their own tools (edit, drag, delete). Blocks do not know what column they reside in. A block can contain multiple widgets (stacked on top of one another) but they cannot contain layout elements.

Blocks are responsible for:

1. Containg Widget(s)
2. Managing their own edit/delete/drag actions
3. Hinting for widget dropping (top, bottom, left, right)

## Utilities Explained

### Editor

The `Editor` is a singleon class that gets initialized inside of `src/index.js`. The Editor is responsible for:

1. Recieving hint events from UI Elements, and showing a hintbar at the correct location with a corresponsding message. 
2. Recieving drag events from Columns, and resizing a column and its `nextElementSibling` (also updating the `mz-cms-span-gridSpan` class).
3. Showing and Hiding Layout Headers
4. Managing `dragIcons` when drag events occur.
5. Grabbing and persisting Layout/Widget information

### Utilities

Because none of the UI-Components inherit from one another (because that doesn't scale well, and it makes testing difficult) all shared methods (like building headers, managing drop events) are contained in a shared utilities location. UI-Components themselves also have private utilities that are located in `src/ui-components/{COMPONENT_NAME}/util.js`.

### Utilities/Factory

At DOM ready, `factory` is used to initialized all preexisting Grids, Rows, Columns, and Widgets.

### Widgets

Widgets will be a collection of custom Mozu widgets. Currently there is only the content widget that requires special interaction, but we assume that other widgets will be required in-time.

## Globals

`Chorizo`

This probably should be changed to `Caliente`. But the global establishes the common class for all Chorizo[classes] to be accessed outside of the Chorizo runtime. (Via `website/index` for things like widget definitions, widget updates, etc.)

`window._mouseposition`

Rows and Columns manange an internal `_mouseposition` variable accessed by `block._mouseposition`, however a global mouseposition is also tracked by Caliente in order to determine the chain of events that should happen on a drop. 

For instance, since drop events only occur on Columns, only a Column can bubble a drop event. However, if the  `window._mouseposition` returns that the hinting is occurring on a row, then we defer that event to the row, even though a column is actually bubbling the drop event. See `afterDrop` inside `src/ui-components/Column`.


## To Do

1. Create Separate Util Files for UI Classes
2. Refactor Editor
3. Write Unit Tests
4. Refactor Content Widget

## Known Bugs

None

