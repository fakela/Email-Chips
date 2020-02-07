(function() {
  "use strict";

  /* Constants */
  const TRIGGER_KEYS = ["Enter", "Tab", ","];


  
  /* Component */
  class BadgeInput extends HTMLElement {
    constructor() {
      super();

      this._items = [];

      this._shadow = this.attachShadow({ mode: "open" });
      var template = document.getElementById("badges");
     this._shadow.appendChild(template.content.cloneNode(true));

      this._input = this._shadow.querySelector("input");
      this._error = this._shadow.querySelector("p");
      this._list = this._shadow.querySelector("ul");
    }

    connectedCallback() {
      this._input.addEventListener("keydown", this.handleKeyDown);
      this._input.addEventListener("paste", this.handlePaste);
      this._list.addEventListener("click", this.handleDelete);
    }

    disconnectedCallback() {
      this._input.removeEventListener("keydown", this.handleKeyDown);
      this._input.removeEventListener("paste", this.handlePaste);
      this._list.removeEventListener("click", this.handleDelete);
    }

    handleKeyDown = evt => {
      this._error.setAttribute("hidden", true);
      this._input.classList.remove("has-error");

      if (TRIGGER_KEYS.includes(evt.key)) {
        evt.preventDefault();

        var value = evt.target.value.trim();

        if (value && this.validate(value)) {
          evt.target.value = "";

          this._items.push(value);
          this.update();
        }
      }
    };

    handlePaste = evt => {
      evt.preventDefault();

      var paste = evt.clipboardData.getData("text");
      var emails = paste.match(/[\w\d\.-]+@[\w\d\.-]+\.[\w\d\.-]+/g);

      if (emails) {
        var toBeAdded = emails.filter(email => !this.isInList(email));

        this._items = [...this._items, ...toBeAdded];
        this.update();
      }
    };

    handleDelete = evt => {
      if (evt.target.tagName === "BUTTON") {
        this._items = this._items.filter(i => i !== evt.target.dataset.value);

        this.update();
      }
    };

    update() {
      this._list.innerHTML = this._items
        .map(function(item) {
          return `
          <li>
            ${item}
            <button type="button" data-value="${item}">&times;</button>
          </li>
        `;
        })
        .join("");
    }

    validate(email) {
      var error = null;

      if (this.isInList(email)) {
        error = `${email} has already been added.`;
      }

      if (!this.isEmail(email)) {
        error = `${email} is not a valid email address.`;
      }

      if (error) {
        this._error.textContent = error;
        this._error.removeAttribute("hidden");
        this._input.classList.add("has-error");

        return false;
      }

      return true;
    }

    isInList(email) {
      return this._items.includes(email);
    }

    isEmail(email) {
      return /[\w\d\.-]+@[\w\d\.-]+\.[\w\d\.-]+/.test(email);
    }
  }

  /* Registration */
  customElements.define("badge-input", BadgeInput);
})();
