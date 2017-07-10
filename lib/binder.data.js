function DataBinder(context, node, field, expression) {
    this.data = context.getSourceValueWithPath(field);
    this.field = field;
    this.node = node;// attr or textNode
    this.context = context;
    this.expression = expression;// attr nodeValue
    this.localChanged = false;
    this.bind();
}
DataBinder.prototype.bind = function () {

    Object.defineProperty(
        this.getDefineObject(this.field),
        this.getDefineKey(this.field),
        {
            set: (value) => {
                this.localChanged = true;
                this.notifyChange(value);
            }, get: (vaue) => {
                return this.data;
            }, configurable: true
        })



}
DataBinder.prototype.getDefineObject = function (field) {

    var pathArray = field.split(".");
    var value = this.context.source;
    while (pathArray.length > 1) {
        value = value[pathArray.shift()];
    }
    return value;
}
DataBinder.prototype.getDefineKey = function (field) {
    return field.split('.').slice(-1);
}
DataBinder.prototype.notifyChange = function (newValue) {
    
    this.data = newValue;

    this.context.listeners[this.field].forEach(item => {
        if (item.node instanceof Attr) {
            item.node.nodeValue = item.expression.replace(/({\w+(\.\w+)*})/g, (filed => {
                return this.context.getSourceValueWithPath(filed.slice(1, -1).trim());
            }))
        } else if (item.node instanceof Node) {
            item.node.nodeValue = newValue
        }
    });



    for (var i = 0, j = this.context.children.length; i < j; i++) {
        var context = this.context.children[i];
        if (context instanceof ArrayBinder) {
            context.notifyChangeWithKey(this.field,newValue);
        } else if (context instanceof SimpleTemplateEngine) {
            var listeners = context.listeners[this.field];
            if (listeners && listeners.length > 0) {
                listeners.forEach(item => {
                    if (item.localChanged === false) {
                        item.notifyChange(newValue)
                    }

                })
            }
        }


    }

}

