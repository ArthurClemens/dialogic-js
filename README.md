# dialogic-js

Control the opening and closing of dialogs and menus using HTML and (optionally) vanilla JavaScript.

This is a basic version of [dialogic](http://github.com/ArthurClemens/dialogic), to be used without a Virtual Dom library.

- [Rationale](#rationale)
- [Limitations](#limitations)
- [Examples](#examples)
  - [Dialog](#dialog)
  - [Menu](#menu)
- [Installation](#installation)
  - [Including on a static site](#including-on-a-static-site)
  - [Installing via npm](#installing-via-npm)
  - [Adding to a Phoenix LiveView project](#adding-to-a-phoenix-liveview-project)
- [HTML structure](#html-structure)
  - [Data attributes and modifiers](#data-attributes-and-modifiers)
  - [Dialog and menu behaviour](#dialog-and-menu-behaviour)
- [Opening, closing and toggling.](#opening-closing-and-toggling)
  - [HTML: Prompt methods](#html-prompt-methods)
  - [JavaScript: Methods on a Prompt instance](#javascript-methods-on-a-prompt-instance)
- [Support for details/summary](#support-for-detailssummary)
- [Support for the dialog element](#support-for-the-dialog-element)
- [Custom styles](#custom-styles)
  - [CSS Variables](#css-variables)
  - [Conditional CSS](#conditional-css)




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
  <dialog data-content>
    <p>Content</p>
    <button onclick="Prompt.hide(this)">Close</button>
  </dialog>
</div>
```

## Limitations

- `<dialog>` is not yet fully supported.
- Support for menu behaviour is limited to appearing - no positioning and specific animations are implemented

## Examples

### Dialog

- [CodeSandbox with UIKit modal](https://codesandbox.io/p/sandbox/dialogic-js-with-a-uikit-modal-joil56)
- [CodeSandbox with Material IO dialog](https://codesandbox.io/p/sandbox/dialogic-js-with-a-material-io-dialog-shg1iv)
- [CodeSandbox with Pico.css modal](https://codesandbox.io/p/sandbox/dialogic-js-with-a-pico-framework-dialog-lefcfi)
- [CodeSandbox with Phonon Framework dialog](https://codesandbox.io/p/sandbox/dialogic-js-with-a-phonon-framework-dialog-vfxupe)
- [CodeSandbox with Primer CSS dialog](https://codesandbox.io/p/sandbox/dialogic-js-with-primercss-dialog-6jpf9y?file=%2Findex.html)
- [CodeSandbox with &lt;dialog&gt;](https://codesandbox.io/p/sandbox/dialogic-js-with-a-dialog-element-td1sxv)

### Menu

- [CodeSandbox with Primer CSS select menu](https://codesandbox.io/p/sandbox/dialogic-js-with-primercss-selectmenu-bv1byj)

## Installation

### Including on a static site

```html
<script src="https://unpkg.com/dialogic-js@0.2.1/dist/dialogic-js.min.js"></script>
<link href="https://unpkg.com/dialogic-js@0.2.1/dist/dialogic-js.min.css" rel="stylesheet" />
```

### Installing via npm

```bash
npm install dialogic-js
```

Import the dependencies:

```js
import { Prompt } from 'dialogic-js';
import 'dialogic-js/dialogic-js.css';
```

### Adding to a Phoenix LiveView project

Inside your assets folder, do:

```bash
npm install dialogic-js
```

Add to your `app.js`:

```js
import { Prompt } from "dialogic-js";
import 'dialogic-js/dialogic-js.css';
```


`Prompt` is a hook to control the opening and closing of dialogs and menus. It handles the showing and hiding of the HTML elements, without dealing with layout itself - to be implemented by you, or by using a UI library and adding "prompt" data attributes.

## HTML structure

`Prompt` recognizes this basic HTML markup:

```html
<div data-prompt id="some-id">
  <div data-touch></div>
  <div data-content>
    Content
  </div>
</div>
```

### Data attributes and modifiers

| **Data attribute** | **Required** | **Description**                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
|--------------------|--------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `data-prompt`      | required     | Container, may be a `<details>` element.<br />Optional attributes:<br />`id` - When opening or closing from outside of this container, an id or other selector is required in order to call methods on it.<br />`data-ismodal` - Creates modal behavior: content can't be closed by clicking on the background.<br />`data-isescapable` - Closes the content when pressing the Escape key.<br />`data-fast` - Creates fast fade transitions for backdrop and content. |
| `data-touch`       | required     | Touch layer, detects clicks on background.                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `data-content`     | required     | Content to be shown (a dialog or menu pane).                                                                                                                                                                                                                                                                                                                                                                                                                          |
| `data-backdrop`    | -            | Backdrop layer.<br />Optional attributes:<br />`data-islight` - Creates a light colored backdrop.<br />`data-isdark` - Creates a dark colored backdrop.<br />`data-ismedium` (default) - Creates a medium colored backdrop.<br />                                                                                                                                                                                                                                     |
| `data-toggle`      | -            | For buttons elements in situations when `prompt.el` has been assigned (using JavaScript).                                                                                                                                                                                                                                                                                                                                                                             |

Example of HTML with all relevant (but some optional) attributes:

```html
<div data-prompt data-ismodal data-isescapable data-isfast id="some-id">
  <div data-backdrop data-islight></div>
  <div data-touch></div>
  <div data-content>
    Content
  </div>
</div>
```

### Dialog and menu behaviour

The markup show above is the default for creating dialog behavior. Dialogs are centered on the screen, whereas menus are normally positioned nearby the calling button (not implemented by dialogic-js).

Menus are supported with the same markup, with this difference: add `aria-role="menu"` to the element that has `data-content`.

```html
<div data-prompt id="some-id">
  <div data-touch></div>
  <div data-content aria-role="menu">
    Content
  </div>
</div>
```

Other common settings used with menus:
- Omit `data-backdrop`, or add `data-islight` to create a very light background
- Add to `data-prompt` duration attribute `data-isfast` to get a fast transition

Example of HTML for a menu with all relevant (but some optional) attributes:

```html
<div data-prompt data-isfast>
  <div data-backdrop data-islight></div>
  <div data-touch></div>
  <div data-content aria-role="menu">
    Content
  </div>
</div>
```

## Opening, closing and toggling.

- When using HTML markup: use methods on the `Prompt` object
- When writing JavaAcript: create a new `Prompt` instance

### HTML: Prompt methods

If you have a dialog container with this markup:

```html
<div data-prompt>
  <button onclick="Prompt.show(this)">Show</button>
  <div data-backdrop></div>
  <div data-touch></div>
  <div data-content>
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
  <div data-content>
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


### JavaScript: Methods on a Prompt instance

Create an instance that can be passed around. Initialize it with attribute `el`.

```html
<div data-prompt>
  <div data-backdrop></div>
  <div data-touch></div>
  <div data-content>
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

## Support for details/summary

Online examples:
- [CodeSandbox with Primer CSS dialog](https://codesandbox.io/p/sandbox/dialogic-js-with-primercss-dialog-6jpf9y?file=%2Findex.html)
- [CodeSandbox with Primer CSS select menu](https://codesandbox.io/p/sandbox/dialogic-js-with-primercss-selectmenu-bv1byj)

The [HTMLDetailsElement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLDetailsElement) element can be used for toggling dialogs and menus. PrimerCSS contains a couple of neat examples, see for example [PrimerCSS Dropdown](https://primer.style/css/components/dropdown). The summary element is styled as button - from the outside you'd never know the source is a details element.

The downside to using `details` is that it provides little support for transitions; the open state is on or off, which leads to a faily basic user experience.

With `dialogic-js` you can combine the `details` markup combined with transitions. 


With HTML markup, the details is initialized with `Prompt.init()`:

```html
<details data-prompt ontoggle="Prompt.init(this)">
  <summary>Open</summary>
  <div data-backdrop></div>
  <div data-touch></div>
  <div data-content>
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
  <div data-content>
    Content
  </div>
</details>
```

```js
var prompt = {...Prompt};
prompt.el = document.querySelector("#my-details")
prompt.show()
```

## Support for the dialog element

Online example: [CodeSandbox with &lt;dialog&gt;](https://codesandbox.io/p/sandbox/dialogic-js-with-a-dialog-element-td1sxv)

Add a wrapper around the `<dialog>` plus the required data attributes:

```html
<div data-prompt id="my-dialog">
  <div data-touch></div>
  <dialog data-content>
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
  <dialog data-content>
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
[data-prompt] dialog[data-content] {
  width: 100%;
  max-width: 60vw;
}
```

Not yet supported:
- Calling `dialog.close` on closing the prompt


## Custom styles

### CSS Variables

Styles are defined by CSS variables. Override the default values to your own requirements. For example:

```html
<style>
  [data-prompt] {
    --prompt-background-color-backdrop: gray;
    --prompt-transition-duration-content: 350ms;
  }
</style>
```

Default values:

```css
[data-prompt] {
  /* colors */
  --prompt-background-color-backdrop: black;
  --prompt-background-opacity-backdrop-medium: 0.2; /* default */
  --prompt-background-opacity-backdrop-dark: 0.5;
  --prompt-background-opacity-backdrop-light: 0.07;
  /* transitions */
  --prompt-transition-timing-function-backdrop: ease-in-out;
  --prompt-transition-timing-function-content: ease-in-out;
  --prompt-transition-duration-content: 220ms;
  --prompt-fast-transition-duration-content: 150ms;
  --prompt-transition-duration-backdrop: var(
    --prompt-transition-duration-content
  );
  --prompt-fast-transition-duration-backdrop: var(
    --prompt-fast-transition-duration-content
  );
  /* z-index */
  --prompt-z-index-backdrop: 98;
  --prompt-z-index-touch: 99;
  --prompt-z-index-content: 100;
  /* size */
  --prompt-max-width-content: 92vw; /* for dialog */
  --prompt-max-height-content: 80vh; /* for dialog */
}
```

### Conditional CSS

You can use [@import](https://developer.mozilla.org/en-US/docs/Web/CSS/@import) with media queries if you need to use dialogic CSS at specific screen sizes:

```css
/* app.css */

@import url("./dialogic-js.css") only screen and (min-width: 544px);
```