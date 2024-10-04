<template>
  <div>
    <DataGridExample />
  </div>
</template>
<script lang="ts">
import DataGridExample from '@/components/DataGrid/DataGridExample.vue';
import { Component, Vue } from 'vue-property-decorator';

@Component({
  components: { DataGridExample },
})
export default class TestPage extends Vue {}
</script>
<style scoped></style>
