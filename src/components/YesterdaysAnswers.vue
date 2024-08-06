<script setup lang="ts">
import { computed } from "vue";
import { useMainStore } from "../store";
import { gridify } from "../utils";

const store = useMainStore();
const size = Math.floor(window.innerWidth / 150);
const gridColumns = [...Array(size).keys()].map((key) => key + 1);
const gridData = computed(() =>
  gridify({
    arr: Array.from(store.getYesterdaysAnswers.answers.sort()),
    size: size,
  })
);
</script>

<template>
  <strong>
    <span
      v-for="letter in store.getYesterdaysAnswers.availableLetters"
      :key="`ydayLetter${letter}`"
      :class="{
        'middle-letter': letter === store.getYesterdaysAnswers.middleLetter,
      }">
      {{ letter }}
    </span>
  </strong>
  <el-table :data="gridData" :cell-class-name="store.cellClassName">
    <el-table-column
      v-for="column in gridColumns"
      :property="String(column)"
      label=""
      width="100" />
  </el-table>
</template>

<style scoped lang="scss">
@import "../assets/styles/_variables";

.middle-letter {
  font-weight: bold;
  color: $bl-yellow;
}
</style>
