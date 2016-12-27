<template>
  <div>{{ foo }}</div>
</template>

<script lang="ts">
import Vue = require('vue')
import Component from 'vue-class-component'
import { foo } from './import'

@Component
export default class TsClass extends Vue {
  foo = foo('123')
}
</script>

<style>
div {
  color: red;
}
</style>