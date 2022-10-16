# dialogic-js

Control the opening and closing of dialogs and menus using HTML and (optionally) vanilla JavaScript.

This is a basic version of [dialogic](http://github.com/ArthurClemens/dialogic), to be used without a Virtual Dom library.

- [Rationale](#rationale)
- [Installation](#installation)
  - [Including on a static site](#including-on-a-static-site)
  - [Installing via npm](#installing-via-npm)
- [Examples](#examples)
- [Dialogic Prompt](#dialogic-prompt)
  - [HTML structure](#html-structure)
  - [Opening, closing and toggling](#opening-closing-and-toggling)
    - [HTML: Prompt methods](#html-prompt-methods)
    - [JavaScript: Methods on a Prompt instance](#javascript-methods-on-a-prompt-instance)
  - [Support for details/summary](#support-for-detailssummary)
  - [Support for dialog](#support-for-dialog)
  - [Custom styles](#custom-styles)


## Rationale

Despite having written a fair amount of JavaScript for dialogs, the number of intricacies still confounds me. And because most code isn't as portable as it could be, I frequently end up writing more code when I begin a new project.

When attempting to add fade in and out behaviour for Primer CSS dialogs, I came to the realisation that I didn't want to write any more custom code before having established a fundamental framework.

Requirements:
- To be used in static HTML or templates
- To be used with JavaScript
- Easy to add to existing HTML markup
- Easy to add behaviours:
  - closing on clicking background
  - modal (prevent closing on clicking background)
  - colored backdrop
  - closing with Escape
  - fading in and out
- Support for `<details>` and `<dialog>`
- Support for Phoenix LiveView hooks

The resulting library uses data attributes to supply to (new or existing) HTML markup. The supplementing CSS is defined around behaviours (state and modifiers), rather than visual appearance. The little styling provided can be customized with CSS Variables.

A basic example with `<dialog>` demonstrates how data attributes replace JS and add additional features.

BEFORE

```html
<!-- HTML -->
<button onclick="showDialog('#my-dialog')">Open</button>

<dialog id="my-dialog">
  <p>Content</p>
  <button onclick="hideDialog('#my-dialog')">Close</button>
</dialog>
  
```

```js
// JS
var dialog = document.querySelector('#my-dialog');

function showDialog(selector) {
  dialog.show();
}
function hideDialog(selector) {
  dialog.close();
}
```

AFTER - includes touch layer, backdrop, fade in and out

```html
<!-- HTML -->
<div data-prompt>
  <button onclick="Prompt.show(this)">Open</button>
  <div data-backdrop></div>
  <div data-touch></div>
  <dialog data-pane>
    <p>Content</p>
    <button onclick="Prompt.hide(this)">Close</button>
  </dialog>
</div>
```

Please note that full support for `<dialog>` needs additional work around methods and events.

## Installation

### Including on a static site

```html
<script src="https://unpkg.com/dialogic-js/dist/dialogic-js.min.js"></script>
<link href="https://unpkg.com/dialogic-js/dist/dialogic-js.min.css" rel="stylesheet" />
```

### Installing via npm

```bash
npm install dialogic-js
```

Import the dependencies:

```js
import { Prompt } from 'dialogic-js';
import 'dialogic-js/dist/dialogic-js.css';
```


## Examples

- [CodeSandbox with Primer CSS dialog](https://codesandbox.io/p/sandbox/dialogic-js-with-primercss-dialog-6jpf9y?file=%2Findex.html)
- [CodeSandbox with &lt;dialog&gt;](https://codesandbox.io/p/sandbox/dialogic-js-with-a-dialog-element-td1sxv)


## Dialogic Prompt

`Prompt` is a hook to control the opening and closing of dialogs and menus. It handles the showing and hiding of the HTML elements, without dealing with layout itself - to be implemented by you, or by using a UI library and adding "prompt" data attributes.

### HTML structure

`Prompt` recognizes this basic HTML markup:

```html
<div data-prompt id="some-id">
  <div data-touch></div>
  <div data-pane>
    Content
  </div>
</div>
```

| **Data attribute** | **Required** | **Description**                                                                                                                                                                                                                                                                                                                                                  |
|--------------------|--------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `data-prompt`      | required     | Container, may be a `<details>` element. When opening or closing from outside of this container, an id or other selector is required in order to call methods on it.<br />Optional attributes:<br />`data-ismodal` - Creates modal behavior: pane can't be closed by clicking on the background.<br />`data-isescapable` - Closes the pane when pressing Escape. |
| `data-touch`       | required     | Touch layer, detects clicks on background.                                                                                                                                                                                                                                                                                                                       |
| `data-pane`        | required     | Dialog or menu pane layer.                                                                                                                                                                                                                                                                                                                                       |
| `data-backdrop`    | -            | Backdrop layer.<br />Optional attributes:<br />`data-islight` - Creates a light colored backdrop.                                                                                                                                                                                                                                                                |
| `data-toggle`      | -            | For buttons elements in situations when `prompt.el` has been assigned (using JavaScript).                                                                                                                                                                                                                                                                        |

Example of HTML with all relevant (but some optional) attributes:

```html
<div data-prompt data-ismodal data-isescapable id="some-id">
  <div data-backdrop data-islight></div>
  <div data-touch></div>
  <div data-pane>
    Content
  </div>
</div>
```

### Opening, closing and toggling

- When using HTML markup: use methods on the `Prompt` object
- When writing JavaAcript: create a new `Prompt` instance

#### HTML: Prompt methods

If you have a dialog container with this markup:

```html
<div data-prompt>
  <button onclick="Prompt.show(this)">Show</button>
  <div data-backdrop></div>
  <div data-touch></div>
  <div data-pane>
    Content
    <button onclick="Prompt.hide(this)">Hide</button>
  </div>
</div>
```

When calling open from outside the prompt container, supply a selector:

```html
<div data-prompt id="my-dialog">
  <div data-backdrop></div>
  <div data-touch></div>
  <div data-pane>
    Content
    <button onclick="Prompt.hide(this)">Hide</button>
  </div>
</div>

<button onclick="Prompt.show('#my-dialog')">Show</button>
```

Opening, closing and toggling are done with these methods:

| **Method**      | **Arguments**           | **Description**                                                                 |
|-----------------|-------------------------|---------------------------------------------------------------------------------|
| `Prompt.show`   | HTML selector / element | Shows the dialog/menu                                                           |
| `Prompt.hide`   | HTML selector / element | Hides the dialog/menu                                                           |
| `Prompt.toggle` | HTML selector / element | Toggles the dialog/menu                                                         |
| `Prompt.init`   | HTML selector / element | When used with `<details>`: initializes the prompt and shows the detail content |


#### JavaScript: Methods on a Prompt instance

Create an instance that can be passed around. Initialize it with attribute `el`.

```html
<div data-prompt>
  <div data-backdrop></div>
  <div data-touch></div>
  <div data-pane>
    Content
  </div>
</div>
```

```js
import { Prompt } from 'dialogic-js';

const prompt = {...Prompt};
prompt.el = document.querySelector('#my-dialog')
prompt.show()
// some time later:
prompt.hide()
```

### Support for details/summary

Online example: [CodeSandbox with Primer CSS dialog](https://codesandbox.io/p/sandbox/dialogic-js-with-primercss-dialog-6jpf9y?file=%2Findex.html)

The [HTMLDetailsElement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLDetailsElement) element can be used for toggling dialogs and menus. PrimerCSS contains a couple of neat examples, see for example [PrimerCSS Dropdown](https://primer.style/css/components/dropdown). The summary element is styled as button - from the outside you'd never know the source is a details element.

The downside to using `details` is that it provides little support for transitions; the open state is on or off, which leads to a faily basic user experience.

With `dialogic-js` you can combine the `details` markup combined with transitions. 


With HTML markup, the details is initialized with `Prompt.init()`:

```html
<details data-prompt ontoggle="Prompt.init(this)">
  <summary>Open</summary>
  <div data-backdrop></div>
  <div data-touch></div>
  <div data-pane>
    Content
  </div>
</details>
```

The alternative approach, using a prompt instance:

```html
<details data-prompt id="my-details">
  <summary>Open</summary>
  <div data-backdrop></div>
  <div data-touch></div>
  <div data-pane>
    Content
  </div>
</details>
```

```js
var prompt = {...Prompt};
prompt.el = document.querySelector("#my-details")
prompt.show()
```

### Support for dialog

Online example: [CodeSandbox with &lt;dialog&gt;](https://codesandbox.io/p/sandbox/dialogic-js-with-a-dialog-element-td1sxv)

Add a wrapper around the `<dialog>` plus the required data attributes:

```html
<div data-prompt id="my-dialog">
  <div data-touch></div>
  <dialog data-pane>
    <p>Content in a minimal dialog</p>
    <button onclick="Prompt.hide(this)">Close</button>
  </dialog>
</div>

<button onclick="Prompt.show('#my-dialog')">Open</button>
```

When using a form:

```html
<div data-prompt id="my-form-dialog" data-isescapable>
  <button onclick="Prompt.show(this)">
    Open form
  </button>
  <div data-touch></div>
  <div data-backdrop></div>
  <dialog data-pane>
    <form method="dialog">
      <p>Would you like to continue?</p>
      <button type="submit" value="no" onclick="Prompt.hide(this)">No</button>
      <button type="submit" value="yes" onclick="Prompt.hide(this)">Yes</button>
    </form>
  </dialog>
</div>
```

Improve dialog size and position with this CSS:

```css
[data-prompt] dialog[data-pane] {
  width: 100%;
  max-width: 60vw;
}
```

Not yet supported:
- Calling `dialog.close` on closing the prompt


### Custom styles

Styles are defined by CSS variables. Override the default values to your own requirements. For example:

```html
<style>
  [data-prompt] {
    --prompt-background-color-backdrop: gray;
    --prompt-transition-duration-pane: 350ms;
  }
</style>
```

Default values:

```css
[data-prompt] {
  --prompt-background-color-backdrop: black;
  --prompt-background-opacity-backdrop-dark: 0.5;
  --prompt-background-opacity-backdrop-light: 0.2;
  --prompt-transition-property-pane: opacity;
  --prompt-transition-duration-pane: 220ms;
  --prompt-transition-duration-backdrop: calc(
    0.8 * var(--prompt-transition-duration-pane)
  );
  --prompt-z-index-backdrop: 1998;
  --prompt-z-index-touch: 1999;
  --prompt-z-index-pane: 2000;
  --prompt-max-width-pane: 90vw;
  --prompt-max-height-pane: 80vh;
}
```