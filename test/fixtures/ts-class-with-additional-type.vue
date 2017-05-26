<template>
  <div>{{ foo }}</div>
</template>

<script lang="ts">
import Vue = require('vue')
import Component from 'vue-class-component'

export type Foo = string;

@Component
export default class TsClass extends Vue {
  foo: Foo = 'Hello'
}
</script>

<style>
div {
  color: red;
}
</style>