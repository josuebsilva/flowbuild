<template>
  <div>
    <div id="myFlow"></div>
    <button @click="addNode">Add Node</button>
    <div style="width: 100px;height: 60px;background: #ccc; cursor: move;" draggable="true">
      Drag Node
    </div>
  </div>
</template>

<script>
import FlowBuilder from '@/plugin/flowbuilder';

export default {
  name: 'TheWelcome',
  components: {
  },
  data() {
    return {
      editor: {},
    };
  },
  methods: {
    addNode() {
      this.editor.addNode();
    },
  },
  created() {
  },
  mounted() {
    this.editor = new FlowBuilder('myFlow', 1200, 600);
    this.editor.render();
  },
};
</script>