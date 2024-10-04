<template>
  <div class="flex-pos relative bg-[#0c3546] w-full h-full overflow-auto">
    <router-view />
  </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
@Component({})
export default class HeroUniverse extends Vue {}
</script>
