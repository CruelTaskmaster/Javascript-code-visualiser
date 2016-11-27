window.output = function printBoxContents()
{
    var parser = document.getElementById("vim").contentWindow.editor;
    document.getElementById("output").innerHTML = parser.getValue();
}