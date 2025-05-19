<script setup lang="ts">
interface Props {
  title: string
  items: string[]
}

defineProps<Props>()
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle>{{ title }}</CardTitle>
    </CardHeader>
    <CardContent>
      <ul class="list-disc list-inside text-sm space-y-2">
        <li v-for="(item, index) in items" :key="index">
          {{ item }}
        </li>
      </ul>
    </CardContent>
  </Card>
</template> 