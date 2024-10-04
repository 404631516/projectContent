<template>
  <div class="h-52 relative <sm:h-26" bg=" no-repeat cover" :style="{backgroundImage: `url(${bannerImg})`}">  
    <h1 class="absolute left-44 <sm:left-8 <lg:(left-15 w-100) bottom-3 w-150 <sm:w-90" p="b-3" border="b-3 solid [#FFF]" font="black" text="6xl [#FFF] left <sm:3xl">{{ title }}</h1>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
@Component({
  components: {
  },
})
export default class Index extends Vue {
   @Prop() private bannerImg!: string;
   @Prop() private title!: string;
}
</script>