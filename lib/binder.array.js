function ArrayBinder(context, node, field, expression, parentNode) {
    this.parentNode = parentNode;
    this.children = [];
    DataBinder.apply(this, arguments);
}

ArrayBinder.prototype = Object.create(DataBinder.prototype);

ArrayBinder.prototype.bind = function () {
    DataBinder.prototype.bind.call(this);
    this.data.insertAt = this.insertAt.bind(this);
    this.data.deleteIn = this.deleteIn.bind(this);
    this.bindChildren();
}
ArrayBinder.prototype.bindChildren = function () {
    let value = this.data;
    let node = this.node;

    this.children.length>0 && this.clear();

    for (var i = 0; i < value.length; i++) {
        var copy = node.cloneNode(true);
        var vm = new SimpleTemplateEngine(copy, value[i], this.context);
        this.children.push(vm);
        this.parentNode.appendChild(copy)
    }
}
ArrayBinder.prototype.clear = function () {
    for (i = 0, j = this.children.length; i < j; i++) {
     
  
    this.parentNode.removeChild(this.children[i].node);
    }
    
    this.children = [];
}
ArrayBinder.prototype.notifyChange = function (data) {

    this.data = data || [];
    this.bindChildren();
    this.notifyChangeIndex();
}
ArrayBinder.prototype.notifyChangeIndex = function () {
    this.data.forEach((item, index) => item.index = index);
}
ArrayBinder.prototype.notifyChangeWithKey = function (key, value) {
    this.children.forEach(item => {
        var listeners = item.listeners[key];
        if (listeners && listeners.length > 0) {
            listeners.forEach(item => {
                if (item.localChanged === false) {
                    item.notifyChange(value)
                }
            })
        }
    })
}

ArrayBinder.prototype.insertAt = function (obj, index/**可选，如果没有则插在最后*/) {

    var copy = this.node.cloneNode(true);
    var view = new SimpleTemplateEngine(copy, obj, this.context);

    if (index === void 0) {

        this.data.push(obj);
        this.context.children.push(view)
        this.parentNode.appendChild(copy);
    }
    else {

        this.data.splice(index, 0, obj);
        his.context.children.split(index, 0, view);
        this.parentNode.insertBefore(copy, this.parentNode.children[index]);
    }
    this.notifyChangeIndex();


}
ArrayBinder.prototype.deleteIn = function (index) {
    let rc = this.parentNode.children[index]
    if (!rc) return console.warn("child index out of range");
    this.data.splice(index, 1);
    this.parentNode.removeChild(rc);
    this.children.splice(index, 1);
    this.notifyChangeIndex();
}

ArrayBinder.prototype.pop = function () {
    this.deleteIn(this.data.length - 1);
}
ArrayBinder
    .prototype.shift = function () {
        this.deleteIn(0);
    }
ArrayBinder.prototype.push = function (obj) {
    this.insertAt(obj);
}
