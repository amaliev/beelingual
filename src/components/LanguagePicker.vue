<script setup lang="ts">
import { useMainStore } from "../store"

const store = useMainStore();
</script>

<template>
  <div class="language-picker">
    <label>
      <input type="radio" id="de" name="language" value="de" />
      Deutsch </label
    ><br /><br />
    <label>
      <input type="radio" id="en" name="language" value="en" />
      English </label
    ><br />
  </div>
</template>
