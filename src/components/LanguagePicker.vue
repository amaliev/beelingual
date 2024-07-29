<script setup lang="ts">
import { useMainStore } from "../store";

const store = useMainStore();
</script>

<template>
  <div class="language-picker">
    <label>
      <input type="radio" name="language" v-model="store.language" id="de" value="de"/>
      Deutsch </label><br /><br />
    <label>
      <input type="radio" name="language" v-model="store.language" id="en" value="en"/>
      English </label><br />
  </div>
</template>
