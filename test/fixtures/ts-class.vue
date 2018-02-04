<template>
  <div>{{ foo }}</div>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'

@Component
export default class TsClass extends Vue {
  foo = 'Hello'
}
</script>

<style>
div {
  color: red;
}
</style>