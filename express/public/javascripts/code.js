var $ = require('jquery');
var _ = require('lodash');
var joint = require('jointjs');

var el1 = new joint.shapes.basic.Rect({
    position: {
        x: 50
        , y: 50
    }
    , size: {
        width: 100
        , height: 40
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
            text: 'Drop me over B'
            , 'font-size': 10
            , style: {
                'text-shadow': '1px 1px 1px lightgray'
            }
        }
    }
});
var paper;
var graph;
window.buildJoint = function () {
    if ((graph instanceof joint.dia.Graph) && (paper instanceof joint.dia.Paper)) {
        graph.get("cells").forEach(
            function(cell) {
                paper.findViewByModel(cell).remove();
            }
        );
        $('#paper-connection-by-dropping').empty();
    }
    graph = new joint.dia.Graph;
    paper = new joint.dia.Paper({
        el: $('#paper-connection-by-dropping')
        , width: 650
        , height: 200
        , gridSize: 1
        , model: graph
    });
    graph.addCells([el1, el1.clone().translate(200, 50).attr('text/text', 'B')]);
    console.log(graph.getCells());
    // Here is the real deal. Listen on cell:pointerup and link to an element found below.
    paper.on('cell:pointerup', function (cellView, evt, x, y) {
        // Find the first element below that is not a link nor the dragged element itself.
        var elementBelow = graph.get('cells').find(function (cell) {
            if (cell instanceof joint.dia.Link) return false; // Not interested in links.
            if (cell.id === cellView.model.id) return false; // The same element as the dropped one.
            if (cell.getBBox().containsPoint(joint.g.point(x, y))) {
                return true;
            }
            return false;
        });
        // If the two elements are connected already, don't
        // connect them again (this is application specific though).
        if (elementBelow && !_.contains(graph.getNeighbors(elementBelow), cellView.model)) {
            graph.addCell(new joint.dia.Link({
                source: {
                    id: cellView.model.id
                }
                , target: {
                    id: elementBelow.id
                }
                , attrs: {
                    '.marker-source': {
                        d: 'M 10 0 L 0 5 L 10 10 z'
                    }
                }
            }));
            // Move the element a bit to the side.
            cellView.model.translate(200, 0);
        }
    });
};
var esprima = require('esprima');
var css = require('../stylesheets/style.css');
window.output = function printBoxContents() {
    var parser = document.getElementById("vim").contentWindow.editor;
    var outputString = parser.getValue();
    console.log(esprima.parse(outputString));
    document.getElementById("output").innerHTML = JSON.stringify(esprima.parse(outputString), null, 2);
}