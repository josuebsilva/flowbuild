<template>
  <div class="drawflow">
    <div id="myFlow" style="float: left;"></div>
    <div style="float: left;padding: 15px;">
      <div class="drawflow-node selectable" draggable="true" data-node="simple_message" @dragstart="drag">
        <div class="drawflow_content_node">
          <div class="flow_end-action">
            <div class="title-box"><span class="material-symbols-outlined" style="float: left;">message</span> Mensagem Simples</div>
          </div>
        </div>
      </div>
      <div class="drawflow-node selectable flow_end" draggable="true" data-node="flow_end" @dragstart="drag">
        <div class="drawflow_content_node">
          <div class="flow_end-action">
            <div class="title-box"><span class="material-symbols-outlined" style="float: left;">done</span> Finalizar fluxo</div>
          </div>
        </div>
      </div>
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
      this.editor.addNode(300, 40, 'finish', [], 1, 0);
    },
    drag(ev) {
      console.log(ev.type);
      ev.dataTransfer.setData('node', ev.target.getAttribute('data-node'));
    },
  },
  created() {
  },
  mounted() {
    this.editor = new FlowBuilder('myFlow', 1020, 600);
    this.editor.render();
    this.editor.on('drop', (data) => {
      switch (data.name) {
        case 'simple_message':
          this.editor.addNode(data.x, data.y, data.name, {}, 1, 1, {
            label: 'Mensagem simples',
            icon: 'message'
          });
          break;
        case 'flow_end':
          this.editor.addNode(data.x, data.y, data.name, {}, 1, 0, {
            background: 'rgb(224, 215, 251)',
            label: 'Finalizar fluxo',
            icon: 'check',
          });
          break;
        default:
          break;
      }
    });
  },
};
</script>
<style>
.selectable {
  cursor: move;
}
.drawflow .drawflow-node {
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-align: center;
  -ms-flex-align: center;
  align-items: center;
  background: #fff;
  width: 200px;
  min-height: 40px;
  border-radius: 4px;
  border: 2px solid #000;
  color: #000;
  z-index: 2;
  padding: 10px;
  margin-left: 15px;
  margin-bottom: 10px;
}

.drawflow .drawflow-node {
  border-radius: 10px !important;
  -webkit-box-shadow: 0 2px 8px 2px rgba(155, 155, 155, 0.2) !important;
  box-shadow: 0 2px 8px 2px rgba(155, 155, 155, 0.2) !important;
  border: 1px solid #ddd !important;
}
.drawflow-node.flow_end {
  color: #000;
  background: rgb(224, 215, 251) !important;
  border-radius: 10px !important;
}
.drawflow-node.flow_end .title-box span{
  color: rgb(165, 151, 208);
}
</style>