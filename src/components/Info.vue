<script setup lang="ts">
import Support from "./Support.vue";
</script>

<template>
  <div class="info-dialog">
    <h3>{{ $t("helpCreateWords") }}</h3>

    <ul>
      <li>{{ $t("helpWordRule1") }}.</li>
      <li>{{ $t("helpWordRule2") }}.</li>
      <li>{{ $t("helpWordRule3") }}.</li>
    </ul>

    <h3>{{ $t("helpScorePoints") }}</h3>

    <ul>
      <li>{{ $t("helpPointsRule1") }}.</li>
      <li>{{ $t("helpPointsRule2") }}.</li>
      <li>{{ $t("helpPointsRule3A") }}. {{ $t("helpPointsRule3B") }}!</li>
    </ul>

    <h3>Support</h3>
    <Support />

    <h3>{{ $t("AboutGame") }}</h3>
    <ul>
      <li>
        {{ $t("AboutGameText") }}
      </li>
      <li>
        {{ $t("InspirationSpellingBee") }}
        <el-link
          type="primary"
          href="https://www.nytimes.com/puzzles/spelling-bee"
          target="_blank">
          New York Times Spelling Bee
        </el-link>
      </li>
      <li>
        {{ $t("EnglishWordlistSource") }}
        <el-link
          type="primary"
          href="https://github.com/en-wl/wordlist/blob/master/alt12dicts/2of4brif.txt"
          target="_blank">
          Wordlist
        </el-link>
      </li>
      <li>
        {{ $t("GermanWordlistSource") }}
        <el-link
          type="primary"
          href="https://github.com/enz/german-wordlist/blob/main/words"
          target="_blank">
          wordlist
        </el-link>
      </li>
    </ul>

    <h3>{{ $t("Bugs") }}</h3>
    <ul>
      <li>
        {{ $t("BugText") }}
        <el-link
          type="primary"
          href="https://github.com/amaliev/beelingual/issues"
          target="_blank"
          >GitHub</el-link
        >
      </li>
    </ul>
  </div>
</template>

<style scoped lang="scss">
.info-dialog {
  text-align: left;
}
</style>
