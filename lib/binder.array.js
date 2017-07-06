function ArrayBinder(context, node, field, expression, parentNode) {
    DataBinder.apply(this, arguments);
    this.parentNode = parentNode;
}

ArrayBinder.prototype = Object.create(DataBinder.prototype);
ArrayBinder.prototype.bind = function () {
    this.data.insertAt = this.insertAt.bind(this);
    this.data.deleteIn = this.deleteIn.bind(this);
}

ArrayBinder.prototype.insertAt = function (obj, index/**可选，如果没有则插在最后*/) {

    var copy = this.node.cloneNode(true);
    var view = new SimpleTemplateEngine(copy, obj, this.context);
    
    if (index === void 0) {

        this.data.push(obj);
        this.parentNode.appendChild(copy);
    }
    else {
    
        this.data.splice(index, 0, obj);
        this.parentNode.insertBefore(copy, this.parentNode.children[index]);
    }

    this.notifyChange();


}
ArrayBinder.prototype.notifyChange = function () {
    this.data.forEach((item, index) => item.index = index);
}
ArrayBinder.prototype.deleteIn = function (index) {
    let rc = this.parentNode.children[index]
    if(!rc) return console.warn("child index out of range");
    this.data.splice(index, 1);
    this.parentNode.removeChild(rc);
    this.notifyChange();
}
