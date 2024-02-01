<template>
  <div class="drawflow">
    <div style="float: left;" class="relative">
      <div id="myFlow"></div>
      <div class="box-tools-flow">
        <div class="btn-flow-tools btn-flow-zoons has-tooltip">
          <span class="material-symbols-outlined" @click="editor.zoom(-1)">zoom_out</span>
        </div>
        <div class="btn-flow-tools btn-flow-zoons has-tooltip" @click="editor.zoom(1)">
          <span class="material-symbols-outlined">zoom_in</span>
        </div>
        <div class="btn-flow-tools btn-flow-zoons has-tooltip" @click="editor.zoom(0)">
          <span class="material-symbols-outlined">search</span>
        </div>
      </div>
    </div>
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
      <div class="drawflow-node selectable flow_template" draggable="true" data-node="template" @dragstart="drag">
        <div class="drawflow_content_node">
          <div class="flow_end-action">
            <div class="title-box"><span class="material-symbols-outlined" style="float: left;">palette</span> Template</div>
          </div>
        </div>
      </div>
      <br>
      <hr>
      <br>
      <div class="drawflow-node" style="cursor: pointer; text-align: center;" @click="exportFlow()">
        <div class="drawflow_content_node" style="width: 100%;">
          <div class="flow_end-action">
            <div class="title-box">Exportar</div>
          </div>
        </div>
      </div>
      <div class="drawflow-node" style="cursor: pointer; text-align: center;" @click="importFlow()">
        <input type="file" accept=".yflow" hidden ref="uploadedFile" @change="uploadFile"/>
        <div class="drawflow_content_node" style="width: 100%;">
          <div class="flow_end-action">
            <div class="title-box">Importar</div>
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
    exportFlow() {
      let exportData = this.editor.export();
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportData));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute('href', dataStr);
      downloadAnchorNode.setAttribute('download', 'flow_yup.yflow');
      document.body.appendChild(downloadAnchorNode); // required for firefox
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
    },
    addNode() {
      this.editor.addNode(300, 40, 'finish', [], 1, 0);
    },
    drag(ev) {
      console.log(ev.type);
      ev.dataTransfer.setData('node', ev.target.getAttribute('data-node'));
    },
    uploadFile(event) {
      const self = this;
      const reader = new FileReader();
      const file = event.target.files[0];

      reader.onload = () => {
        const jsonFile = reader.result;
        this.editor.import(JSON.parse(jsonFile));
      };
      reader.readAsText(file, 'UTF-8');
    },
    importFlow() {
      this.$refs.uploadedFile.click();
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
        case 'template':
          this.editor.addNode(data.x, data.y, data.name, {}, 1, 1, {
            background: 'rgb(118 255 219)',
            label: 'Template',
            icon: 'palette',
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
.relative {
  position: relative;
}
.box-tools-flow {
  position: absolute;
  top: 20%;
  right: 14px;
}
.btn-flow-tools.btn-flow-zoons {
  background: #fff;
  width: 40px;
  height: 40px;
  border: 1px solid #788db4;
  margin: 0 auto;
  margin-top: 20px;
}
.btn-flow-zoons:hover {
  background: #d1daeb;
}
.btn-flow-tools {
  z-index: 9;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: #752de6;
  text-align: center;
  cursor: pointer;
  padding-top: 5px;
  -webkit-box-shadow: 0 12px 10px 0 rgba(0,0,0,.152);
  box-shadow: 0 6px 10px 0 rgba(0,0,0,.152);
}

.drawflow-node.flow_template {
    color: #fff;
    background: rgb(72 193 161) !important;
    border-radius: 10px !important;
}
</style>