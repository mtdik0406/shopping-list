<script setup lang="ts">
// PR-1 の仮の画面。実際の画面は PR-7 以降で UI_DESIGN に従って作る。
</script>

<template>
  <main class="placeholder">
    <h1 class="placeholder__title">買い物リスト</h1>
    <p class="placeholder__text">準備中</p>
  </main>
</template>

<style scoped>
.placeholder {
  padding: var(--space-6) var(--space-4);
}

.placeholder__title {
  margin: 0 0 var(--space-2);
  font: var(--text-display);
  color: var(--color-text);
}

.placeholder__text {
  margin: 0;
  font: var(--text-body);
  color: var(--color-text-secondary);
}
</style>
