<template></template>

<script lang="ts">
import { WebGameName } from '@/helper/enum/WebGame';
import { Component, Vue } from 'vue-property-decorator';

@Component({})
export default class Index extends Vue {
  async created() {
    // TODO: 目前沒有處理任何邏輯就直接到遊戲內，待確認需求後補上(背景的處理等等)
    this.$router.replace({ name: `${WebGameName.HeroUniverseGame}` });
  }
}
</script>
