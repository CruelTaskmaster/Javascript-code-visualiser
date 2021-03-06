'use strict'
//Load node.js modules here
var $ = require('jquery');
var _ = require('lodash');
var joint = require('jointjs');
var esprima = require('esprima');
var css = require('../stylesheets/style.css');
//Test string for visualisation software
const JSONString = {
    "global": [
        {
            "sublayer": [
                {
                    "variable": [
                        {
                            "name": "i"
                }
                , {
                            "name": "j"
                }
                            ]
        }
        , {
                    "function": [
                        {
                            "name": "setPoint"
                            , "parameter": "i,j"
                            , "return": "null"
                }
                , {
                            "name": "getPoint"
                            , "parameter": ""
                            , "return": "i,j"
                }
                            ]
        }
                    ]
    }, {
            "sublayer2": [
                {
                    "variable": [
                        {
                            "name": "k"
                }
                , {
                            "name": "l"
                }
                            ]
        }
        , {
                    "function": [
                        {
                            "name": "setPoint"
                            , "parameter": "k,l"
                            , "return": "null"
                }
                , {
                            "name": "getPoint"
                            , "parameter": ""
                            , "return": "k,l"
                }
                            ]
        }
                    ]
    }
        , , {
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
//Variable declrations
var generatedString = {};
var paper;
var graph;
/*
    function for translating esprima json into usable jsonstring for visualisation software
    the jsonstring is then used to generate the visualised diagram
*/
window.buildJoint = function () {
    //This takes in the data obtained from analysing the code within the browser editor
    var outputString = esprima.parse(document.getElementById("vim").contentWindow.editor.getValue());
    console.log(JSONString);
    generatedString = {};
    //Case checks for generating the custom JSON string
    if (outputString.type == 'Program') {
        _.forEach(outputString.body, function (value, key) {
            //console.log(key);
            if (value.type == 'FunctionDeclaration') {
                var funcObj = {
                    name: value.id.name
                };
                var parameters = "";
                for (var i = 0; i < value.params.length; ++i) {
                    if (i > 0) {
                        parameters += ",";
                    }
                    parameters += value.params[i].name;
                }
                funcObj['parameter'] = parameters;
                FillObject(generatedString, 'function', funcObj, 'global');
                //console.log(generatedString);
            }
            else if (value.type == 'VariableDeclaration') {
                for (var i = 0; i < value.declarations.length; ++i) {
                    FillObject(generatedString, 'variable', {
                        name: value.declarations[i].id.name
                    }, 'global');
                }
                //console.log(generatedString);
            }
        });
    }
    console.log(generatedString);
    //Function used to generate the JSON values
    function FillObject(targetCollection, valueName, attributes, namespace) {
        //console.log(targetCollection);
        var collectionObject = {};
        collectionObject[valueName] = [attributes];
        if (targetCollection[namespace] == null) {
            targetCollection[namespace] = [];
        }
        var hasCollection;
        for (var i = 0; i < targetCollection[namespace].length; ++i) {
            var keyArray = Object.keys(targetCollection[namespace][i]);
            for (var j = 0; j < keyArray.length; ++j) {
                console.log(keyArray[j]);
                if (keyArray[j] == valueName) {
                    hasCollection = targetCollection[namespace][i][valueName];
                    break;
                }
            }
            if (hasCollection != null) {
                hasCollection.push(attributes);
                break;
            }
        }
        if (hasCollection == null) {
            targetCollection[namespace].push(collectionObject);
        }
    };
    /*
        Here is where the diagram is generated using JointJS
    */
    const boxPadding = 0.1;
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
    //Declaration for a custom JointJS shape
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
    //Recursively goes through the custom JSON string and finds functions and variables
    //Boxes are then created to represent the functions and variables
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
        //console.log(objectName, "before", capsuleBox.get('position'), capsuleBox.get('size'));
        graph.addCells([capsuleBox]);
        var prevSize = 0;
        _.forEach(objectToProcess, function (value, key) {
            //console.log(objectName, key, prevSize);
            var output;
            if (key == 'variable') {
                capsuleBox.attr({
                    text: {
                        text: 'variable'
                    }
                });
                output = createVarContents(value, px, py + prevSize);
            }
            else if (key == 'function') {
                capsuleBox.attr({
                    text: {
                        text: 'function'
                    }
                });
                output = createFuncContents(value, px, py + prevSize);
            }
            else if (typeof value === 'object') {
                output = indexContent(value, key, px, py, 0, prevSize);
                if (_.isArray(output)) {
                    for (var i = 0; i < output.length; ++i) {
                        prevSize += output[i].get('size').height;
                    }
                }
                else {
                    prevSize += output.get('size').height;
                }
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
        if (!isNaN(capsuleBox.attr('text/text'))) {
            var boxCollection = [];
            capsuleBox.getEmbeddedCells().forEach(function (value) {
                //console.log(value);
                capsuleBox.unembed(value);
                value.translate(prevX + prevX * boxPadding, prevY + prevY * boxPadding);
                boxCollection.push(value);
            });
            graph.removeCells([capsuleBox]);
            capsuleBox = boxCollection;
        }
        else {
            capsuleBox.fitEmbeds({
                padding: {
                    top: 40
                    , left: 15
                    , right: 10
                    , bottom: 10
                }
            });
            capsuleBox.translate(prevX + prevX * boxPadding, prevY + prevY * boxPadding);
            //console.log(capsuleBox.attr('text/text'), prevX * boxPadding, prevY * boxPadding);
            //console.log(objectName, "after", capsuleBox.get('position'), capsuleBox.get('size'));
        }
        return capsuleBox;
    };
    var prevSize = 0;
    _.forEach(generatedString, function (value, key) {
        var value = indexContent(value, key, 50, 50, prevSize, 50);
        prevSize = value.get('size').width;
        prevSize = prevSize + prevSize * boxPadding;
    })

    function createVarContents(varObject, dx, dy) {
        var nameTags = [];
        var i = 0;
        var prevHeight = 0;
        _.forEach(varObject, function (value, key) {
            var temp = createContent(value.name, dx, dy + (prevHeight + 10) * i);
            prevHeight = temp.get('size').height;
            nameTags.push(temp);
            ++i;
        })
        return nameTags;
    };

    function createFuncContents(funcObject, dx, dy) {
        var nameTags = [];
        var i = 0;
        var prevHeight = 0;
        _.forEach(funcObject, function (value, key) {
            var temp = createContent(value.name + "(" + value.parameter + ")", dx, dy + (prevHeight + 10) * i);
            prevHeight = temp.get('size').height;
            nameTags.push(temp);
            ++i;
        })
        return nameTags;
    };

    function createContent(chosenName, dx, dy) {
        if (!(typeof chosenName == 'string' || chosenName instanceof String)) {
            throw new Error('Object passed is not a string.');
        }
        var contentBox = new joint.shapes.basic.Rect({
            position: {
                x: dx
                , y: dy
            }
            , size: {
                width: 100
                , height: 20
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
    
    //Code which restraints the boxes to stay within their parent boxes
    graph.on('change:position', function (cell) {
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
    });
};