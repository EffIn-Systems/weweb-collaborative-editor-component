<template>
    <div style="padding: 20px; border: 2px solid green; background: #f0f0f0;">
      <h2>✅ Test Component Working!</h2>
      <p>If you can see this, the component system works.</p>
      <p>Props: {{ JSON.stringify(content) }}</p>
    </div>
  </template>
  
  <script>
  export default {
    name: 'collaborative-editor',
    props: {
      content: { type: Object, default: () => ({}) }
    },
    mounted() {
      console.log('✅ TEST COMPONENT MOUNTED!', this.content);
    }
  }
  </script>