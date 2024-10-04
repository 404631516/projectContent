<template>
  <div class="planet-wrapper flex-pos" :style="planetBg">
    <router-view />
  </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import ImgPath from '@/config/imgPath/imgPath';
@Component({})
export default class PlanetWar extends Vue {
  private planetBg: string = `background: url(${ImgPath.planetBgBaseUrl})`;
}
</script>
<style lang="scss">
.planet-wrapper {
  position: relative;
  background-color: #0C3546;
  width: 100%;
  height: 100%;
  overflow: auto;
  background-size: contain !important;
}
</style>
