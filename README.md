# vuetype

[![npm version](https://badge.fury.io/js/vuetype.svg)](https://badge.fury.io/js/vuetype)
[![Build Status](https://travis-ci.org/ktsn/vuetype.svg?branch=master)](https://travis-ci.org/ktsn/vuetype)

Generate TypeScript declaration files for .vue files

## Installation

You can use `vuetype` command after exec one of following commands.

```bash
$ npm install --global vuetype # npm
$ yarn global add vuetype # yarn
```

## Usage

Specify the directory that includes your `.vue` files as the 2nd argument of `vuetype` command. Note that the `.vue` files should have TypeScript code (in `<script lang="ts">` element).

```bash
vuetype src/components
```

Then `.vue.d.ts` file corresponding `.vue` file will be output. So you can import each `.vue` component with concrete type declaration! This would useful if you would like to unit test your components in TypeScript.

For example, if there is the following component:

```html
<template>
  <div>{{ message }}</div>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'

@Component
export default class MyComp extends Vue {
  message = 'Hello'
}
</script>
```

You will acquire the following declaration file:

```ts
import Vue from 'vue';
export default class MyComp extends Vue {
    message: string;
}
```

### Watch mode

You can enable watch mode by adding `--watch` (shorthand `-w`) flag. In the watch mode, vuetype watches update of `.vue` files and generates declaration files when the `.vue` files are updated.

```bash
vuetype --watch src/components
```

## License

MIT
