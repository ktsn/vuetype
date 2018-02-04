<template>
  <Target />
</template>

<script lang="ts">
import Vue, { VueConstructor } from 'vue'
import Target from './import-other-target.vue'

export default Vue.extend({
  components: {
    Target
  },

  data () {
    return {
      foo: 'Hello'
    }
  }
})
</script>
