<template>
  <div class="webgame-warrper">
    <router-view />
  </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
@Component({})
export default class H5Game extends Vue {}
</script>
<style lang="scss" scoped>
.webgame-warrper {
  height: 100%;
  // padding: 0 30vw 0;
  background-image: radial-gradient(#212121E6, #000);
}
</style>
