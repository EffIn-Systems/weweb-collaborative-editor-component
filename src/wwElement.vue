<template>
    <div ref="mountPoint" class="collaborative-editor-container">
      <!-- React will mount here -->
    </div>
  </template>
  
  <script>
  export default {
    name: 'collaborative-editor',
    props: {
      content: { type: Object, default: () => ({}) },
      wwEditorState: { type: Object, default: () => ({}) }
    },
    data() {
      return {
        reactRoot: null,
        isMounted: false
      }
    },
    mounted() {
      console.log('🟢 Vue component mounted!', this.content);
      this.isMounted = true;
      this.$nextTick(() => {
        this.initReactApp();
      });
    },
    beforeUnmount() {
      console.log('🔴 Vue component unmounting...');
      this.isMounted = false;
      if (this.reactRoot) {
        this.reactRoot.unmount();
        this.reactRoot = null;
      }
    },
    watch: {
      // Watch for changes to content props
      content: {
        deep: true,
        handler(newContent, oldContent) {
          console.log('📝 Props changed:', { old: oldContent, new: newContent });
          // Re-initialize React app when props change
          if (this.reactRoot) {
            this.reactRoot.unmount();
            this.reactRoot = null;
          }
          this.$nextTick(() => {
            this.initReactApp();
          });
        }
      }
    },
    methods: {
      async initReactApp() {
        if (!this.isMounted) return;
        
        try {
          console.log('🚀 Initializing React app with props:', this.content);
          
          // Import React components
          const React = await import('react');
          const ReactDOM = await import('react-dom/client');
          const { App } = await import('./App.jsx');
          const { Editor } = await import('./Editor.jsx');
          
          console.log('✅ React modules loaded');
          
          if (!this.isMounted || !this.$refs.mountPoint) {
            console.log('⚠️ Component unmounted before React could initialize');
            return;
          }
          
          // Get the actual values from content
          const roomId = this.content?.roomId || 'my-room';
          const publicApiKey = this.content?.publicApiKey || '';
          
          console.log('🔑 Using API Key:', publicApiKey ? `${publicApiKey.substring(0, 10)}...` : 'NO KEY');
          
          // Create React root
          this.reactRoot = ReactDOM.createRoot(this.$refs.mountPoint);
          
          // Render React app with current props
          this.reactRoot.render(
            React.createElement(App, {
              roomId: roomId,
              publicApiKey: publicApiKey,
              currentUser: this.content?.currentUser || null
            },
              React.createElement(Editor)
            )
          );
          
          console.log('✅ React app rendered with roomId:', roomId);
          
        } catch (error) {
          console.error('❌ Failed to init React app:', error);
          if (this.$refs.mountPoint) {
            this.$refs.mountPoint.innerHTML = `
              <div style="padding: 20px; background: #ffe6e6; border: 1px solid #ff0000;">
                <strong>Error:</strong> ${error.message}<br>
                <small>Props: ${JSON.stringify(this.content)}</small>
              </div>
            `;
          }
        }
      }
    }
  }
  </script>
  
  <style scoped>
  .collaborative-editor-container {
    width: 100%;
    height: 400px;
    min-height: 200px;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    overflow: auto;
  }
  </style>