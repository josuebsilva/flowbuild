import Konva from 'konva';

export default class FlowBuilder {
    constructor(container, width = 800, height = 500) {
        this.container = container;
        this.stage = null;
        this.gridLayer = null;
        this.stageRect = null;
        this.viewRect = null;
        this.fullRect = null;
        this.gridAdjust = null;
        this.gridRect = null;
        this.width = width;
        this.height = height;
        this.stepSize = 40; // set a value for the grid step gap.
        this.layer = null;
        this.drawingLine = false;
        this.connections = [];
        this.selectionRectangle = null;
        this.events = {};
        this.newScale = 0;
        this.nodes = {
            "drawflow": {
                "Home": {
                    "data": {
                        "1": {
                            "id": "1",
                            "name": "welcome",
                            "data": {
                            },
                            "inputs": [
                            ],
                            "pos_x": 135,
                            "pos_y": 160,
                            "outputs": {
                                "output_1": {
                                    "connections": [
                                        {
                                            "node": 2,
                                            "output": "input_1"
                                        }
                                    ]
                                }
                            }
                        },
                    }
                }
            },
        };
    }

    /* Events */
    on(event, callback) {
        // Check if the callback is not a function
        if (typeof callback !== 'function') {
            console.error(`The listener callback must be a function, the given type is ${typeof callback}`);
            return false;
        }
        // Check if the event is not a string
        if (typeof event !== 'string') {
            console.error(`The event name must be a string, the given type is ${typeof event}`);
            return false;
        }
        // Check if this event not exists
        if (this.events[event] === undefined) {
            this.events[event] = {
                listeners: [],
            };
        }
        this.events[event].listeners.push(callback);
    }

    removeListener(event, callback) {
        // Check if this event not exists

        if (!this.events[event]) return false;

        const listeners = this.events[event].listeners;
        const listenerIndex = listeners.indexOf(callback);
        const hasListener = listenerIndex > -1;
        if (hasListener) listeners.splice(listenerIndex, 1);
    }

    dispatch(event, details) {
        // Check if this event not exists
        if (this.events[event] === undefined) {
            // console.error(`This event: ${event} does not exist`);
            return false;
        }
        this.events[event].listeners.forEach((listener) => {
            listener(details);
        });
    }

    makeStartNode(x, y) {
        var groupNode = new Konva.Group({
            x: x,
            y: y,
            draggable: true,
        });


        var output = new Konva.Circle({
            x: node.width() - 1,
            y: node.height() / 2,
            radius: 10,
            fill: 'white',
            stroke: '#E5E5E5',
            strokeWidth: 4,
        });
        groupNode.add(output);
        groupNode.add(node);
        groupNode.add(title);
        node.zIndex(0);
        output.zIndex(1);

        node.listening(true);
        groupNode.listening(true);

        this.layer.add(groupNode);
        this.layer.draw();
    }

    render() {
        this.stage = new Konva.Stage({
            container: this.container,   // id of container <div>
            width: this.width,
            height: this.height,
            draggable: true,
        });
        this.layer = new Konva.Layer();
        this.gridLayer = new Konva.Layer({
            draggable: true,
            x: 0,
            y: 0,
        });

        // add the shape to the layer

        this.drawGrid();

        this.stage.add(this.gridLayer);
        this.stage.add(this.layer);

        var tr = new Konva.Transformer();
        tr.draggable = true;
        this.layer.add(tr);


        this.addNode(20, 20, 'welcome');
        this.addNode(300, 40, 'whats', [], 1, 2);
        this.generateSelect();
        this.eventsListener();
    }

    generateSelect() {
        this.selectionRectangle = new Konva.Rect({
            fill: 'rgba(0,0,255,0.5)',
            visible: false,
        });
        this.layer.add(this.selectionRectangle);
    }

    makeDelete(pos_x = 90, pos_y = -10, name = null) {
        let tooltip = new Konva.Label({
            name,
            width: 90,
            x: pos_x,
            y: pos_y,
            opacity: 1,
            scale: {
                cursor: 'pointer'
            }
        });
        tooltip.add(
            new Konva.Tag({
                fill: 'white',
                pointerDirection: 'down',
                pointerWidth: 10,
                pointerHeight: 10,
                lineJoin: 'round',
                shadowColor: 'black',
                stroke: '#E5E5E5',
                shadowColor: '#ccc',
                shadowBlur: 5,
                shadowOffset: { x: 2, y: 2 },
                shadowOpacity: 0.3,
                strokeWidth: 4,
            })
        );
        var icon = new Konva.Text({
            padding: 10,
            align: 'center',
            width: 90,
            height: 40,
            text: 'delete',
            fontSize: 25,
            fontFamily: 'Material Symbols Outlined',
            fill: '#c9c7c7',
        });
        icon.on('mouseover', (e) => {
            console.log(e);
            this.stage.container().style.cursor = 'pointer';
        });
        icon.on('mouseout', (e) => {
            this.stage.container().style.cursor = 'default';
        });
        tooltip.add(icon);

        tooltip.on('click', (e) => {
            console.log(e.target.parent);
            console.log('Delete name', e.target.parent.getAttr('name'));
            let name = e.target.parent.getAttr('name');
            if (name.includes('delete_node')) {
                var id = name.replace('delete_node_', '');
                let itemId = '.node_' + id;
                var element = this.stage.findOne(itemId);
                

                if (this.connections.length > 0) {
                    console.log('id', id);
                    var index = 0
                    let connection = this.connections.find((con, i) => {
                        index = i;
                        return con.node_in === parseInt(id) || con.node_out === parseInt(id);
                    });
                    console.log(connection);
                    if (connection) {
                        let output = this.stage.findOne('.'+connection.output_name);
                        if(output) {
                            output.setAttr('fill', '#fff');
                        }

                        let input  = this.stage.findOne('.'+connection.input_name);
                        if(input) {
                            input.setAttr('fill', '#fff');
                        }
                        
                        let nodeInput = this.nodes.drawflow.Home.data[connection.node_in];
                        let nodeOutput = this.nodes.drawflow.Home.data[connection.node_out];

                        console.log('nodeInput', nodeInput);
                        console.log('nodeOutput', nodeOutput);
                        
                        nodeInput.inputs[`input_${connection.input_index}`].connections.forEach((con, i) => {
                            if(con.output_name == connection.output_name) {
                                nodeInput.inputs[`input_${connection.input_index}`].connections.splice(i, 1);
                            }
                        });

                        nodeOutput.outputs[`output_${connection.output_index}`].connections.forEach((con, i) => {
                            if(con.input_name == connection.input_name) {
                                nodeOutput.outputs[`output_${connection.output_index}`].connections.splice(i, 1);
                            }
                        });

                        connection.line.remove();
                        this.connections.splice(index, 1);
                    }
                }

                delete this.nodes.drawflow.Home.data[id];
                element.remove();
            }

            if (name.includes('delete_line')) {
                var id = name.replace('delete_line_', '');
                if (this.connections.length > 0) {
                    console.log('id', id);
                    let connection = this.connections.find((con, index) => {
                        return con.id === parseInt(id);
                    });
                    let nodeInput = this.nodes.drawflow.Home.data[connection.node_in];
                    let nodeOutput = this.nodes.drawflow.Home.data[connection.node_out];
                    
                    nodeInput.inputs[`input_${connection.input_index}`].connections.forEach((con, i) => {
                        if(con.output_name == connection.output_name) {
                            nodeInput.inputs[`input_${connection.input_index}`].connections.splice(i, 1);
                        }
                    });

                    nodeOutput.outputs[`output_${connection.output_index}`].connections.forEach((con, i) => {
                        if(con.input_name == connection.input_name) {
                            nodeOutput.outputs[`output_${connection.output_index}`].connections.splice(i, 1);
                        }
                    });

                    console.log('nodeInput', nodeInput);
                    console.log('nodeOutput', nodeOutput);

                    console.log(connection);
                    let output = this.stage.findOne('.'+connection.output_name);
                    output.setAttr('fill', '#fff');
                    let input  = this.stage.findOne('.'+connection.input_name);
                    input.setAttr('fill', '#fff');
                    if (connection) {
                        connection.line.remove();
                        this.connections.splice(index, 1);
                    }
                }
            }

            console.log(this.connections);
            console.log(this.nodes);
            tooltip.remove();
            this.stage.container().style.cursor = 'default';
        });
        setTimeout(() => {
            tooltip.remove();
            this.stage.container().style.cursor = 'default';
        }, 2000);
        return tooltip;
    }

    addNode(x, y, name, data, num_in = 0, num_out = 1, style = {}) {

        var groupNode = new Konva.Group({
            name,
            x: x,
            y: y,
            draggable: true,
        });
        groupNode.setAttr('id', groupNode._id);
        if (name != 'welcome')
            groupNode.setAttr('name', `node_${groupNode._id}`);

        var node = null;
        var input = null;
        var tooltip = null;
        var inputs = {};
        var outputs = {};
        let heightNode = 60;
        let distanceOut = heightNode / 2;
        let distanceIn = heightNode / 2;
        let background = 'white';
        if(style.background) {
            background = style.background;
        }
        switch (name) {
            case 'welcome':
                node = new Konva.Rect({
                    x: 0,
                    y: 0,
                    width: 200,
                    height: 150,
                    fill: background,
                    stroke: '#E5E5E5',
                    strokeWidth: 4,
                    cornerRadius: 8,
                    shadowColor: '#ccc',
                    shadowBlur: 5,
                    shadowOffset: { x: 2, y: 2 },
                    shadowOpacity: 0.3,
                });
                distanceOut = 150 / 2
                var title = new Konva.Text({
                    x: node.width() / 2 - 40,
                    y: node.height() / 2 + 20,
                    text: 'Passo Inicial',
                    fontSize: 18,
                    fontFamily: 'Calibri',
                    fontStyle: 'bold',
                    fill: '#252525',
                });
                var SOURCE = '/assets/instagram.svg';
                Konva.Image.fromURL(SOURCE, (imageNode) => {
                    groupNode.add(imageNode);
                    imageNode.setAttrs({
                        width: 40,
                        height: 40,
                        x: node.width() / 2 - 20,
                        y: node.height() / 2 - 40,
                    });
                });
                break;

            default:
                var maxValue = Math.max(num_out, num_in)
                if (num_out > 1) {
                    distanceOut = 30;
                }
                if (num_in > 1) {
                    distanceIn = 30;
                }
                heightNode *= maxValue;
                node = new Konva.Rect({
                    x: 0,
                    y: 0,
                    width: 220,
                    height: heightNode,
                    fill: background,
                    stroke: '#E5E5E5',
                    strokeWidth: 4,
                    cornerRadius: 8,
                    shadowColor: '#ccc',
                    shadowBlur: 5,
                    shadowOffset: { x: 2, y: 2 },
                    shadowOpacity: 0.3,
                });
                var title = new Konva.Text({
                    x: 50,
                    y: 20,
                    text: style.label,
                    fontSize: 18,
                    fontFamily: 'Calibri',
                    fill: '#252525',
                });
                var icon = new Konva.Text({
                    x: -10,
                    y: 8,
                    padding: 10,
                    align: 'center',
                    width: 90,
                    height: 40,
                    text: style.icon,
                    fontSize: 25,
                    fontFamily: 'Material Symbols Outlined',
                    fill: '#252525',
                });
                break;
        }

        for (var i = 1; i <= num_out; i++) {
            let name = `output_${i}_node_${groupNode._id}`;
            var output = new Konva.Circle({
                name: name,
                x: node.width(),
                y: (distanceOut * i),
                radius: 10,
                fill: 'white',
                stroke: '#E5E5E5',
                strokeWidth: 4,
            });
            distanceOut = (heightNode / num_out) - 15;
            outputs[`output_${i}`] = {
                name,
                id: output._id,
                index: i,
                connections: [],
            };
            output.setAttr('index', i);
            groupNode.add(output);
            output.zIndex(1);
            output.on('mousedown', (e) => {
                this.drawingLine = true;
                console.log('Output target', e);
                console.log('getAbsolutePosition', e.target.getAbsolutePosition())
                const posMouse = e.target.getStage().getRelativePointerPosition();
                const posTarget = e.target.getAbsolutePosition();
                var points = [posMouse.x, posMouse.y];
                let index = e.target.getAttr('index');
                console.log('index maked', index);
                var line = new Konva.Line({
                    name: `line_node_${groupNode._id}_out_${output._id}`,
                    points: points,
                    //stroke: '#4af7c6',
                    stroke: '#ccc',
                    strokeWidth: 4,
                    lineCap: 'round',
                    lineJoin: 'round',
                    //dash: [20, 20],
                });

                this.connections.push({
                    id: line._id,
                    node_out: groupNode._id,
                    line: line,
                    points: [posMouse.x, posMouse.y],
                    output_name: output.getAttr('name'),
                    output_index: index,
                    output_name: `output_${index}_node_${groupNode._id}`,
                });
                this.layer.add(line);
                line.zIndex(0);
                line.on('mouseover', (e) => {
                    e.target.attrs.stroke = '#03fcd3';
                    line.zIndex(0);
                    e.target.draw();
                    if (!this.drawingLine) {
                        let deleteConnection = this.stage.findOne(`.delete_line_${e.target._id}`);
                        if (deleteConnection == null) {
                            deleteConnection = this.makeDelete(e.target.getRelativePointerPosition().x, e.target.getRelativePointerPosition().y, `delete_line_${e.target._id}`);
                            this.layer.add(deleteConnection);
                        }
                    }
                });
                line.on('mouseout', function (e) {
                    e.target.attrs.stroke = '#E5E5E5';
                    line.zIndex(0);
                    e.target.draw();
                });
                /*var anim = new Konva.Animation(function (frame) {
                    line.dash(dash);
                }, this.layer);
                anim.start();*/
            });
        }
        for (var i = 1; i <= num_in; i++) {
            let name = `input_${i}_node_${groupNode._id}`;
            var input = new Konva.Circle({
                name: name,
                x: 0,
                y: (distanceIn * i),
                radius: 10,
                fill: 'white',
                stroke: '#E5E5E5',
                strokeWidth: 4,
            });
            distanceIn = (heightNode / num_in) - 15;
            inputs[`input_${i}`] = {
                id: input._id,
                index: i,
                name,
                connections: []
            };
            input.setAttr('index', i);
            groupNode.add(input);
            input.zIndex(1);
            input.on('mouseup', (e) => {
                console.log('Aui');
                //this.drawingLine = false;
                console.log('Input target', e);
                console.log('getAbsolutePosition', e.target.getAbsolutePosition())
                const posMouse = e.target.getStage().getRelativePointerPosition();
                const posTarget = e.target.getAbsolutePosition();
                var points = [posMouse.x, posMouse.y];
                var oncircle = e.target;
                if (this.drawingLine) {
                    let index = e.target.getAttr('index');
                    console.log('Connections', this.connections);
                    console.log('Connections', oncircle);
                    const lastLine = this.connections[this.connections.length - 1];
                    lastLine.points = [
                        lastLine.points[0],
                        lastLine.points[1],
                        e.target.x(),
                        e.target.y(),
                    ];
                    this.connections[this.connections.length - 1].input_name  = e.target.getAttr('name');
                    this.connections[this.connections.length - 1].input_index = index;
                    this.connections[this.connections.length - 1].node_in = oncircle.parent._id;
                    let node_out = this.connections[this.connections.length - 1].node_out;
                    let output_name = this.connections[this.connections.length - 1].output_name;
                    let output_index = this.connections[this.connections.length - 1].output_index;
                    console.log(this.nodes.drawflow.Home.data[oncircle.parent._id]);
                    console.log(this.connections[this.connections.length - 1]);
                    console.log('input_' + index);
                    this.nodes.drawflow.Home.data[oncircle.parent._id].inputs['input_' + index].connections.push(
                        {
                            node: node_out,
                            output: 'output_' + output_index,
                            output_name: output_name
                        }
                    );
                    this.nodes.drawflow.Home.data[this.connections[this.connections.length - 1].node_out].outputs['output_' + output_index].connections.push(
                        {
                            node: oncircle.parent._id,
                            input: 'input_' + index,
                            input_name: `input_${index}_node_${groupNode._id}`
                        }
                    );
                    input.setAttr('fill', '#03fcd3');
                    let outputCircle = this.stage.findOne('.' + output_name);
                    outputCircle.setAttr('fill', '#03fcd3');

                    lastLine.line.setAttr('name', `node_in_${groupNode._id}_input_${index}_node_out_${node_out}_output_${output_index}`);
                    console.log(this.nodes);
                }
                this.drawingLine = false;
            });
        }
        if (title) {
            groupNode.add(title);
        }
        if (tooltip) {
            groupNode.add(tooltip);
        }
        if (icon) {
            //groupNode.add(icon);
        }
        groupNode.add(node);

        node.zIndex(0);

        groupNode.on('mousemove', (e) => {
            if (this.drawingLine) {
                e.target.parent.setDraggable(false);
            }
        });
        groupNode.on('mouseup', (e) => {
            this.drawingLine = false;
            groupNode.setDraggable(true);
        });

        groupNode.on('dragmove', (e) => {
            console.log('Moving Node', e.target);
            let target = e.target;
            let node = this.nodes.drawflow.Home.data[target._id];
            console.log(node);
            if (node.inputs) {
                let inputs = Object.values(node.inputs);
                if (inputs.length > 0) {
                    inputs.forEach((input) => {
                        if (input.connections.length > 0) {
                            input.connections.forEach((connection) => {
                                let line_name = `node_in_${target._id}_input_${input.index}_node_out_${connection.node}_${connection.output}`
                                let inputCircle = this.stage.findOne('.' + input.name);
                                let outputCircle = this.stage.findOne('.' + connection.output_name);
                                let line = this.stage.findOne('.' + line_name);
                                let stageX = this.stage.position().x;
                                let stageY = this.stage.position().y;

                                var outPutX = outputCircle.getAttr('x') + outputCircle.parent.getAttr('x');
                                var outPutY = outputCircle.getAttr('y') + outputCircle.parent.getAttr('y');
                                var inputX = inputCircle.getAttr('x') + target.getAttr('x');
                                var inputY = inputCircle.getAttr('y') + target.getAttr('y');

                                if(line) {
                                    line.points([outPutX, outPutY, inputX, inputY]);
                                    line.sceneFunc((context, shape) => {
                                        const width = inputX - outPutX;
                                        const height = inputY - outPutY;
                                        const dir = Math.sign(height);
                                        const radius = Math.min(20, Math.abs(height / 2), Math.abs(width / 2));

                                        context.beginPath();
                                        context.moveTo(outPutX, outPutY);
                                        context.lineTo(outPutX + width / 2 - 20, outPutY);
                                        context.quadraticCurveTo(
                                            outPutX + width / 2,
                                            outPutY,
                                            outPutX + width / 2,
                                            outPutY + dir * radius
                                        );
                                        context.lineTo(outPutX + width / 2, inputY - dir * radius);
                                        context.quadraticCurveTo(
                                            outPutX + width / 2,
                                            inputY,
                                            outPutX + width / 2 + radius,
                                            inputY
                                        );
                                        context.lineTo(inputX, inputY);
                                        context.fillStrokeShape(shape);
                                    });
                                }
                                console.log(line);
                            });
                        }
                    })
                }
            }
            if (node.outputs) {
                let outputs = Object.values(node.outputs);
                console.log(node.outputs);
                if (outputs.length > 0) {
                    outputs.forEach((output) => {
                        if (output.connections.length > 0) {
                            output.connections.forEach((connection) => {
                                let line_name = `node_in_${connection.node}_${connection.input}_node_out_${target._id}_output_${output.index}`
                                let inputCircle = this.stage.findOne('.' + connection.input_name);
                                let inputNode = this.layer.findOne('#' + connection.node);
                                let outputCircle = this.stage.findOne('.' + output.name);
                                console.log('line_name', line_name);
                                console.log('inputCircle', inputCircle);
                                console.log('childrens', this.layer.children);
                                console.log('connection', '#' + connection.node);
                                let line = this.stage.findOne('.' + line_name);
                                console.log('Input getAbsolutePosition', inputCircle.getAbsolutePosition());
                                console.log('Input getPosition', inputCircle.getPosition());
                                console.log('stage.position().x', this.stage.position().x);

                                var stageX = this.stage.position().x;
                                var stageY = this.stage.position().y;

                                var outPutX = outputCircle.getAttr('x') + target.getAttr('x');
                                var outPutY = outputCircle.getAttr('y') + target.getAttr('y');
                                var inputX = inputCircle.getAttr('x') + inputCircle.parent.getAttr('x');
                                var inputY = inputCircle.getAttr('y') + inputCircle.parent.getAttr('y');

                                console.log('New Input X', inputX);
                                console.log(e.target.getAttr('x'));

                                if(line) {
                                    line.points([outPutX, outPutY, inputX, inputY]);
                                    line.sceneFunc((context, shape) => {
                                        const width = inputX - outPutX;
                                        const height = inputY - outPutY;
                                        const dir = Math.sign(height);
                                        const radius = Math.min(20, Math.abs(height / 2), Math.abs(width / 2));

                                        context.beginPath();
                                        context.moveTo(outPutX, outPutY);
                                        context.lineTo(outPutX + width / 2 - 20, outPutY);
                                        context.quadraticCurveTo(
                                            outPutX + width / 2,
                                            outPutY,
                                            outPutX + width / 2,
                                            outPutY + dir * radius
                                        );
                                        context.lineTo(outPutX + width / 2, inputY - dir * radius);
                                        context.quadraticCurveTo(
                                            outPutX + width / 2,
                                            inputY,
                                            outPutX + width / 2 + radius,
                                            inputY
                                        );
                                        context.lineTo(inputX, inputY);
                                        context.fillStrokeShape(shape);
                                    });
                                }
                                console.log(line);
                            });
                        }
                    })
                }
            }
            //myArray.find(x => x.id === '45')
        });

        node.on('mouseover', (e) => {
            e.target.attrs.stroke = '#00D6A366';
            console.log(e.target);
            if (e.target.parent.getAttr('name') != 'welcome') {
                let deleteNode = this.stage.findOne(`.delete_node_${e.target.parent._id}`);
                if (deleteNode == null) {
                    deleteNode = this.makeDelete(90, -10, `delete_node_${e.target.parent._id}`);
                    e.target.parent.add(deleteNode);
                }
            }
            e.target.zIndex(0);
            e.target.draw();
        });
        groupNode.on('mouseout', (e) => {

        });
        node.on('mouseout', function (e) {
            e.target.attrs.stroke = '#E5E5E5';
            e.target.zIndex(0);
            e.target.draw();
        });
        node.listening(true);
        groupNode.listening(true);

        this.layer.add(groupNode);
        this.layer.draw();

        //Make object json
        this.nodes.drawflow.Home.data[groupNode._id] = {
            id: groupNode._id,
            name: name,
            data,
            inputs,
            pos_x: x,
            pos_y: y,
            outputs,
        };
    }

    lineEvent(target) {

    }

    eventsListener() {
        let x = new Konva.Layer();
        var scaleBy = 1.01;
        let currentScale = 6;
        let scales = [5, 4, 3, 2.5, 2, 1.5, 1, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1, 0.05]
        this.stage.on('wheel', (e) => {
            // stop default scrolling
            e.evt.preventDefault();

            var oldScale = this.stage.scaleX();
            var pointer = this.stage.getPointerPosition();

            var mousePointTo = {
                x: (pointer.x - this.stage.x()) / oldScale,
                y: (pointer.y - this.stage.y()) / oldScale,
            };

            // how to scale? Zoom in? Or zoom out?
            let direction = e.evt.deltaY > 0 ? 1 : -1;

            // when we zoom on trackpad, e.evt.ctrlKey is true
            // in that case lets revert direction
            if (e.evt.ctrlKey) {
                direction = -direction;
            }

            if (direction > 0) {
                currentScale = currentScale > 0 ? currentScale - 1 : currentScale;
            }
            else {
                currentScale = currentScale < scales.length - 1 ? currentScale + 1 : currentScale;
            }

            this.newScale = scales[currentScale];

            this.stage.scale({ x: this.newScale, y: this.newScale });

            var newPos = {
                x: pointer.x - mousePointTo.x * this.newScale,
                y: pointer.y - mousePointTo.y * this.newScale,
            };

            this.stage.position(newPos);

            this.stage.draw();
            this.drawGrid();
        });
        this.stage.on('mouseup', (e) => {
            this.stage.setDraggable(true);
            const oncircle = e.target instanceof Konva.Circle;
            if (this.drawingLine) {
                if (!oncircle) {
                    this.connections[this.connections.length - 1].line.remove();
                    this.connections.splice(this.connections.length - 1, 1);
                }
            }
        });
        this.stage.on('click', (e) => {
            const onstage = e.target instanceof Konva.Stage;

            console.log('Target up', e.target);
        });
        this.stage.on('mousedown', (e) => {
            const oncircle = e.target instanceof Konva.Circle;
            if (!oncircle) {
                return;
            }
            console.log('Target Output', oncircle);
            console.log(e.target);
        });
        this.stage.on('mousemove', (e) => {
            if (this.drawingLine) {
                this.stage.setDraggable(false);
                const posMouse = e.target.getStage().getRelativePointerPosition();
                const lastLine = this.connections[this.connections.length - 1];
                lastLine.points = [lastLine.points[0], lastLine.points[1], posMouse.x, posMouse.y];
                lastLine.line.points(lastLine.points);
                lastLine.line.sceneFunc((context, shape) => {
                    const width = posMouse.x - lastLine.points[0];
                    const height = posMouse.y - lastLine.points[1];
                    const dir = Math.sign(height);
                    const radius = Math.min(20, Math.abs(height / 2), Math.abs(width / 2));

                    context.beginPath();
                    context.moveTo(lastLine.points[0], lastLine.points[1]);
                    context.lineTo(lastLine.points[0] + width / 2 - 20, lastLine.points[1]);
                    context.quadraticCurveTo(
                        lastLine.points[0] + width / 2,
                        lastLine.points[1],
                        lastLine.points[0] + width / 2,
                        lastLine.points[1] + dir * radius
                    );
                    context.lineTo(lastLine.points[0] + width / 2, posMouse.y - dir * radius);
                    context.quadraticCurveTo(
                        lastLine.points[0] + width / 2,
                        posMouse.y,
                        lastLine.points[0] + width / 2 + radius,
                        posMouse.y
                    );
                    context.lineTo(posMouse.x, posMouse.y);
                    context.fillStrokeShape(shape);
                });
            }
        });
        this.stage.on('dragend', (e) => {
            this.drawGrid();
        });

        var con = this.stage.container();
        con.addEventListener('dragover', (e) => {
            e.preventDefault(); // !important
        });

        con.addEventListener('drop', (e) => {
            e.preventDefault();
            // now we need to find pointer position
            // we can't use stage.getPointerPosition() here, because that event
            // is not registered by Konva.Stage
            // we can register it manually:
            this.stage.setPointersPositions(e);
            this.dispatch('drop', {
                name: e.dataTransfer.getData('node'),
                x: this.stage.getPointerPosition().x,
                y: this.stage.getPointerPosition().y
            });
            console.log('Drop', e);
            console.log(e.dataTransfer.getData('node'));
        });
    }

    updateLines() {
    }

    unScale(val) {
        return (val / this.stage.scaleX());
    }

    drawGrid() {
        this.gridLayer.clear();
        this.gridLayer.destroyChildren();
        this.gridLayer.clipWidth(null); // clear any clipping

        this.stageRect = {
            x1: 0,
            y1: 0,
            x2: this.stage.width(),
            y2: this.stage.height(),
            offset: {
                x: this.unScale(this.stage.position().x),
                y: this.unScale(this.stage.position().y),
            }
        };
        this.viewRect = {
            x1: -this.stageRect.offset.x,
            y1: -this.stageRect.offset.y,
            x2: this.unScale(this.width) - this.stageRect.offset.x,
            y2: this.unScale(this.height) - this.stageRect.offset.y
        };
        // and find the largest rectangle that bounds both the stage and view rect.
        // This is the rect we will draw on.  
        this.fullRect = {
            x1: Math.min(this.stageRect.x1, this.viewRect.x1),
            y1: Math.min(this.stageRect.y1, this.viewRect.y1),
            x2: Math.max(this.stageRect.x2, this.viewRect.x2),
            y2: Math.max(this.stageRect.y2, this.viewRect.y2)
        };
        let gridOffset = {
            x: Math.ceil(this.unScale(this.stage.position().x) / this.stepSize) * this.stepSize,
            y: Math.ceil(this.unScale(this.stage.position().y) / this.stepSize) * this.stepSize,
        };
        let gridRect = {
            x1: -gridOffset.x,
            y1: -gridOffset.y,
            x2: this.unScale(this.width) - gridOffset.x + this.stepSize,
            y2: this.unScale(this.height) - gridOffset.y + this.stepSize
        };
        this.gridFullRect = {
            x1: Math.min(this.stageRect.x1, gridRect.x1),
            y1: Math.min(this.stageRect.y1, gridRect.y1),
            x2: Math.max(this.stageRect.x2, gridRect.x2),
            y2: Math.max(this.stageRect.y2, gridRect.y2)
        };

        // set clip function to stop leaking lines into non-viewable space.
        this.gridLayer.clip({
            x: this.viewRect.x1,
            y: this.viewRect.y1,
            width: this.viewRect.x2 - this.viewRect.x1,
            height: this.viewRect.y2 - this.viewRect.y1
        });

        let fullRect = this.gridFullRect;

        const
            // find the x & y size of the grid
            xSize = (fullRect.x2 - fullRect.x1),
            ySize = (fullRect.y2 - fullRect.y1),

            // compute the number of steps required on each axis.
            xSteps = Math.round(xSize / this.stepSize),
            ySteps = Math.round(ySize / this.stepSize);

        // draw vertical lines
        for (let i = 0; i <= xSteps; i++) {
            this.gridLayer.add(
                new Konva.Line({
                    x: fullRect.x1 + i * this.stepSize,
                    y: fullRect.y1,
                    points: [0, 0, 0, ySize],
                    stroke: '#E5E5E5',
                    strokeWidth: 1,
                })
            );
        }
        //draw Horizontal lines
        for (let i = 0; i <= ySteps; i++) {
            this.gridLayer.add(
                new Konva.Line({
                    x: fullRect.x1,
                    y: fullRect.y1 + i * this.stepSize,
                    points: [0, 0, xSize, 0],
                    stroke: '#E5E5E5',
                    strokeWidth: 1,
                })
            );
        }

        this.gridLayer.batchDraw();
    }

    dispatch(event, details) {
        // Check if this event not exists
        if (this.events[event] === undefined) {
            // console.error(`This event: ${event} does not exist`);
            return false;
        }
        this.events[event].listeners.forEach((listener) => {
            listener(details);
        });
    }
}