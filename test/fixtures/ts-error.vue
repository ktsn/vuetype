<template>
  <div>{{ foo }}</div>
</template>

<script lang="ts">
import Vue = require('vue')
import Component from 'vue-class-component'

@Component
export default class TsClass extends Vue {
  foo: number = 'Hello'
}
</script>

<style>
div {
  color: red;
}
</style>