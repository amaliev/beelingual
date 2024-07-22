<template>
  <span>If you're enjoying the game you can show your support by</span>
  <ul>
    <li>
      Starring the project on
      <el-link
        type="primary"
        href="https://github.com/amaliev/beelingual"
        target="_blank">
        GitHub
        <img
          height="36"
          src="../assets/github.svg"
          alt="github"
          class="github-icon" />
      </el-link>
    </li>
    <li>
      or the original project / creator on
      <el-link
        type="primary"
        href="https://github.com/ConorSheehan1/spelling-bee"
        target="_blank">
        GitHub
        <img
          height="36"
          src="../assets/github.svg"
          alt="github"
          class="github-icon" />
      </el-link>
    </li>
  </ul>
</template>

<style scoped lang="scss">
html.dark {
  .github-icon {
    filter: invert(0.8);
  }
}
</style>
