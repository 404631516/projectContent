<template>
  <InterstellarForumLayout>
    <router-view />
  </InterstellarForumLayout>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import InterstellarForumLayout from '@/components/InterstellarForum/InterstellarForumLayout.vue';
@Component({
  components: {
    InterstellarForumLayout,
  },
})
export default class InterstellarForum extends Vue {}
</script>
<style lang="scss" scoped></style>
