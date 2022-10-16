# dialogic-js

Control the opening and closing of dialogs and menus with HTML and vanilla JS.

This is a more basic version of [dialogic](http://github.com/ArthurClemens/dialogic), to be used without a Virtual Dom library.

- [Dialogic Prompt](#dialogic-prompt)
  - [HTML structure](#html-structure)
  - [Opening, closing and toggling](#opening-closing-and-toggling)
    - [HTML: Prompt methods](#html-prompt-methods)
    - [JavaScript: Methods on a Prompt instance](#javascript-methods-on-a-prompt-instance)
  - [Support for details/summary](#support-for-detailssummary)
    - [Full example with Primer CSS dialog](#full-example-with-primer-css-dialog)
  - [Custom styles](#custom-styles)

## Dialogic Prompt

`Prompt` is a hook to control the opening and closing of dialogs and menus. It handles the showing and hiding of the HTML elements, without dealing with layout itself - to be implemented by you, or by using a UI library and adding "prompt" data attributes.

### HTML structure

`Prompt` recognizes this basic HTML structure:

```html
<div data-prompt>
  <div data-touch />
  <div data-pane>
    Content
  </div>
</div>
```

To create a backdrop, add a div with `data-backdrop`, plus the additional attribute `data-islight` to create a lighter backdrop. 

```html
<div data-prompt>
  <div data-backdrop data-islight />
  <div data-touch />
  <div data-pane>
    Content
  </div>
</div>
```

### Opening, closing and toggling

You can use either methods on the `Prompt` object (easier in HTML templates), or create a new `Prompt` instance (easier in JavaScript code).

#### HTML: Prompt methods

If you have a dialog container with this markup:

```html
<div data-prompt id="my-dialog">
  <div data-backdrop />
  <div data-touch />
  <div data-pane>
    Content
  </div>
</div>

<button onclick="Prompt.show('my-dialog')">Show</button>
```

When used inside the prompt markup, you may use `this` instead of a selector:

```html
<div data-prompt id="my-dialog">
  <div data-backdrop />
  <div data-touch />
  <div data-pane>
    Content
    <button onclick="Prompt.hide(this)">Hide</button>
  </div>
</div>

<button onclick="Prompt.show('my-dialog')">Show</button>
```

Opening, closing and toggling are done with these functions:

```ts
Prompt.show(command)
Prompt.hide(command)
Prompt.toggle(command)
Prompt.init(command)

type Command =
  /**
   * HTML selector
   */
  | string
  /**
   * HTML element
   */
  | HTMLElement;
```

#### JavaScript: Methods on a Prompt instance

Create an instance that can be passed around. Initialize it with attribute `el`.

Inside the prompt container you may use a button with data attribute `data-toggle` to handle opening of the item.

```html
<div data-prompt id="my-dialog">
  <button data-toggle>Open</button>
  <div data-backdrop />
  <div data-touch />
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

The [HTMLDetailsElement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLDetailsElement) element can be used for toggling dialogs and menus. PrimerCSS contains a couple of neat examples, see for example [PrimerCSS Dropdown](https://primer.style/css/components/dropdown). The summary element is styled as button - from the outside you'd never know the source is a details element.

The downside to using `details` is that it provides little support for transitions; the open state is on or off, which leads to a faily basic user experience.

With `dialogic-js` you can combine the `details` markup combined with transitions. 

With HTML markup, the details is initialized with `Prompt.init()`:

```html
<details data-prompt ontoggle="Prompt.init(this)">
  <summary>Open</summary>
  <div data-backdrop />
  <div data-touch />
  <div data-pane>
    Content
  </div>
</details>
```

The alternative approach, using a prompt instance:

```html
<details data-prompt id="my-details">
  <summary>Open</summary>
  <div data-backdrop />
  <div data-touch />
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

#### Full example with Primer CSS dialog

See [CodeSandbox example](https://codesandbox.io/p/sandbox/dialogic-js-with-primercss-dialog-6jpf9y?file=%2Findex.html)

```html
<details class="details-reset" data-prompt ontoggle="Prompt.init(this)">
  <summary class="btn" aria-haspopup="dialog">Open dialog</summary>
  <div data-backdrop></div>
  <div data-touch></div>
  <div class="Box Box--overlay d-flex flex-column anim-fade-in fast" data-pane>
    <div class="Box-header">
      <button class="Box-btn-octicon btn-octicon float-right" type="button" aria-label="Close dialog" onclick="Prompt.hide(this)">
        <!-- <%= octicon "x" %> -->
        <svg class="octicon octicon-x" viewBox="0 0 12 16" version="1.1" width="12" height="16" aria-hidden="true"><path fill-rule="evenodd" d="M7.48 8l3.75 3.75-1.48 1.48L6 9.48l-3.75 3.75-1.48-1.48L4.52 8 .77 4.25l1.48-1.48L6 6.52l3.75-3.75 1.48 1.48L7.48 8z"></path></svg>
      </button>
      <h3 class="Box-title">Box title</h3>
    </div>
    <div class="overflow-auto">
      <div class="Box-body overflow-auto">
        <p>
          The quick brown fox jumps over the lazy dog and feels as if he were in the seventh heaven of typography together with Hermann Zapf, the most famous artist of the...
        </p>
      </div>
      <ul>
        <li class="Box-row">
          <img class="avatar v-align-middle mr-2" src="https://avatars.githubusercontent.com/broccolini?s=48" alt="broccolini" width="24" height="24">
          @broccolini
        </li>
        <li class="Box-row border-bottom">
          <img class="avatar v-align-middle mr-2" src="https://avatars.githubusercontent.com/jonrohan?s=48" alt="jonrohan" width="24" height="24">
          @jonrohan
        </li>
        <li class="Box-row border-bottom">
          <img class="avatar v-align-middle mr-2" src="https://avatars.githubusercontent.com/shawnbot?s=48" alt="shawnbot" width="24" height="24">
          @shawnbot
        </li>
      </ul>
    </div>
    <div class="Box-footer">
      <button type="button" class="btn btn-block" onclick="Prompt.hide(this)">Okidoki</button>
    </div>
  </div>
</details>
```

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
