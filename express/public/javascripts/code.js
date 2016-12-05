var $ = require('jquery');
var _ = require('lodash');
var joint = require('jointjs');
const JSONString = {
    "global": [
        {
            "type": "name"
            , "sublayer": [
                {
                    "variable": [
                        {
                            "name": "x"
                }
                , {
                            "name": "y"
                }
                            ]
        }
        , {
                    "function": [
                        {
                            "name": "setPoint"
                            , "parameter": "x,y"
                            , "return": "null"
                }
                , {
                            "name": "getPoint"
                            , "parameter": ""
                            , "return": "x,y"
                }
                            ]
        }
                    ]
    }
        , {
            "variable": [
                {
                    "name": "x"
                }
                , {
                    "name": "y"
                }
                            ]
        }
            , {
            "function": [
                {
                    "name": "setPoint"
                    , "parameter": "x,y"
                    , "return": "null"
                }
                , {
                    "name": "getPoint"
                    , "parameter": ""
                    , "return": "x,y"
                }
                            ]
             }
              ]
    , "jointjs": [
        {
            "variable": [
                {
                    "name": "a"
                }
                , {
                    "name": "b"
                }
                        ]
        }
        , {
            "function": [
                {
                    "name": "setJoint"
                    , "parameter": "a,b"
                    , "return": "null"
                }
                , {
                    "name": "getJoint"
                    , "parameter": ""
                    , "return": "a,b"
                }
                        ]
        }
                 ]
};
var paper;
var graph;
window.buildJoint = function () {
    var selectedDiv = $('#paper-connection-by-dropping');
    if ((graph instanceof joint.dia.Graph) && (paper instanceof joint.dia.Paper)) {
        graph.get("cells").forEach(function (cell) {
            paper.findViewByModel(cell).remove();
        });
        $('#paper-connection-by-dropping').empty();
    }
    graph = new joint.dia.Graph;
    paper = new joint.dia.Paper({
        el: selectedDiv
        , width: selectedDiv.width()
        , height: selectedDiv.height()
        , gridSize: 1
        , model: graph
    });
    var baseBox = joint.shapes.basic.Generic.extend({
        markup: '<g class="rotatable"><g class="scalable"><rect/></g><text/></g>'
        , defaults: joint.util.deepSupplement({
            type: 'basic.CapsuleRect'
            , attrs: {
                'rect': {
                    fill: 'white'
                    , stroke: 'black'
                    , 'follow-scale': true
                    , width: 80
                    , height: 40
                }
                , 'text': {
                    'font-size': 14
                    , 'ref-x': .1
                    , 'ref-y': 15
                    , ref: 'rect'
                    , 'y-alignment': 'top'
                    , 'x-alignment': 'left'
                }
            }
        }, joint.shapes.basic.Generic.prototype.defaults)
        , isLink: function () {
            return false;
        }
    });

    function indexContent(objectToProcess, objectName, px, py, prevX, prevY) {
        var capsuleBox = new baseBox({
            position: {
                x: px
                , y: py
            }
            , size: {
                width: 200
                , height: 600
            }
            , attrs: {
                rect: {
                    'stroke-width': '5'
                    , 'stroke-opacity': .7
                    , stroke: 'black'
                    , rx: 3
                    , ry: 3
                    , fill: 'lightgray'
                    , 'fill-opacity': .5
                }
                , text: {
                    text: objectName
                    , 'font-size': 10
                    , style: {
                        'text-shadow': '1px 1px 1px lightgray'
                    }
                }
            }
        });
        console.log(objectName, "before", capsuleBox.get('position'), capsuleBox.get('size'));
        graph.addCells([capsuleBox]);
        var prevSize = 0;
        _.forEach(objectToProcess, function (value, key) {
            var output;
            if (key == 'variable') {
                capsuleBox.attr({
                    text: {
                        text: 'variable'
                    }
                });
                output = createVarContents(value);
            }
            else if (key == 'function') {
                capsuleBox.attr({
                    text: {
                        text: 'function'
                    }
                });
                output = createFuncContents(value);
            }
            else if (typeof value === 'object') {
                output = indexContent(value, key, px, py, 0, prevSize);
                prevSize = output.get('size').height;
            }
            else {
                console.log("nothing ever happens");
            }
            if (output != null) {
                //console.log(key, output);
                if (_.isArray(output)) {
                    for (i = 0; i < output.length; ++i) {
                        capsuleBox.embed(output[i]);
                    }
                }
                else {
                    capsuleBox.embed(output);
                }
                graph.addCells(output);
            }
        });
        capsuleBox.fitEmbeds({
            padding: {
                top: 40
                , left: 15
                , right: 10
                , bottom: 10
            }
        });
        capsuleBox.translate(prevX + prevX * 0.1, prevY + prevY * 0.1);
        console.log(objectName, "after", capsuleBox.get('position'), capsuleBox.get('size'));
        return capsuleBox;
    };
    var prevSize = 0;
    _.forEach(JSONString, function (value, key) {
        var value = indexContent(value, key, 50, 50, prevSize, 50);
        prevSize = value.get('size').width;
        prevSize = prevSize + prevSize * 0.1;
    })

    function createVarContents(varObject) {
        var nameTags = [];
        var i = 0;
        _.forEach(varObject, function (value, key) {
            nameTags.push(createContent(value.name, i));
            ++i;
        })
        return nameTags;
    };

    function createFuncContents(funcObject) {
        var nameTags = [];
        var i = 0;
        _.forEach(funcObject, function (value, key) {
            nameTags.push(createContent(value.name + "(" + value.parameter + ")", i));
            ++i;
        })
        return nameTags;
    };

    function createContent(chosenName, increment) {
        if (!(typeof chosenName == 'string' || chosenName instanceof String)) {
            throw new Error('Object passed is not a string.');
        }
        var contentBox = new joint.shapes.basic.Rect({
            position: {
                x: 50
                , y: 50 + increment * 50
            }
            , size: {
                width: 100
                , height: 40
            }
            , attrs: {
                rect: {
                    'stroke-width': '5'
                    , 'stroke-opacity': .7
                    , stroke: 'white'
                    , rx: 3
                    , ry: 3
                    , fill: 'aqua'
                    , 'fill-opacity': .5
                }
                , text: {
                    text: chosenName
                    , 'font-size': 10
                    , style: {
                        'text-shadow': '1px 1px 1px lightgray'
                    }
                }
            }
        });
        return contentBox;
    };
    /*    graph.on('change:position', function (cell) {
            var parentId = cell.get('parent');
            if (!parentId) return;
            var parent = graph.getCell(parentId);
            var parentBbox = parent.getBBox();
            var cellBbox = cell.getBBox();
            if (parentBbox.containsPoint(cellBbox.origin()) && parentBbox.containsPoint(cellBbox.topRight()) && parentBbox.containsPoint(cellBbox.corner()) && parentBbox.containsPoint(cellBbox.bottomLeft())) {
                // All the four corners of the child are inside
                // the parent area.
                return;
            }
            // Revert the child position.
            cell.set('position', cell.previous('position'));
        });*/
};
var esprima = require('esprima');
var css = require('../stylesheets/style.css');
window.output = function printBoxContents() {
    var parser = document.getElementById("vim").contentWindow.editor;
    var outputString = parser.getValue();
    console.log(esprima.parse(outputString));
    console.log(JSONString);
    document.getElementById("output").innerHTML = JSON.stringify(esprima.parse(outputString), null, 2);
}