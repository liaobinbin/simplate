function SimpleTemplateEngine(node, sourceData = {}, parent) {
    this.node = node;
    this.source = sourceData;
    this.listeners = {};
    this.children=[];
    this.parent = parent;// 如果一个视图中，存在作用域嵌套，子作用域通过parent来访问父级source
    this.parseHtml(this.node.childNodes);
}
SimpleTemplateEngine.components={};
SimpleTemplateEngine.applyComponent=function(name,component){
    this.components[name.toUpperCase()]=component;
}


// 遍历整个dom，找到所有的 {fieldName} 建立创建一个 DataBinder对象
SimpleTemplateEngine.prototype.parseHtml = function (children) {

    // 拷贝一个副本
    children = Array.prototype.slice.call(children);
    for (var i = 0; i < children.length; i++) {
        var node = children[i];
        if(SimpleTemplateEngine.components[node.tagName]){
            this.handleComponent(node.tagName);
            continue;
        }
        var attrs = Array.prototype.slice.call(node.attributes || []);
        if (attrs && attrs.length > 0) {
            var repeaterIndex = attrs.findIndex(item => item.name === "repeater");
            if (repeaterIndex > -1) {
                this.bindArray(node, node.attributes[repeaterIndex]);
                continue;
            }
            this.handleAttributeContent(node.attributes);
        }
        if (node.nodeType === 3) {// 只处理 text 类型的节点，字符串
            var newNodes = this.handleTextContent(node.textContent, node, node.parentNode);
            var parentNode = node.parentNode;
            newNodes.forEach(item => {
                parentNode.insertBefore(item, node);
            });
            parentNode.removeChild(node);
            this.bindData(newNodes);
        }
        if (node.childNodes.length > 0) {
            this.parseHtml(node.childNodes);
        }
    }
}
SimpleTemplateEngine.prototype.handleTextContent = function (content) {
    var reg = /\{\s*\w+(\.\w+)*\s*\}/g

    var field = null;
    var index = 0;
    var resultTextNodes = []

    while (field = reg.exec(content)) {
        var text = content.slice(index, field.index);
        index = field.index + field[0].length;
        if (index > 0) {
            resultTextNodes.push(text);
        }
        resultTextNodes.push(field[0])
    }
    let matchedLength = resultTextNodes.join('').length;
    if (matchedLength !== content.length) {
        resultTextNodes.push(content.slice(matchedLength));
    }
    return resultTextNodes.map(item => document.createTextNode(item));
}
SimpleTemplateEngine.prototype.handleAttributeContent = function (attributes) {
    Array.prototype.slice.call(attributes).forEach(item => {

        item.nodeValue = item.nodeValue.replace(/({\w+(\.\w+)*})/g, (field) => {
            var key = field.slice(1, -1).trim();
            var listener = this.addListener(item, key, item.nodeValue);
            return listener.data;
        })
    });
}
SimpleTemplateEngine.prototype.handleComponent=function(name){

}
SimpleTemplateEngine.prototype.bindData = function (nodes) {
    nodes.forEach(item => {
        var data = item.data;
        if (data[0] === "{" && data[data.length - 1] === "}") {
            var field = data.slice(1, -1).trim();
            item.nodeValue = this.getSourceValueWithPath(field);
            this.handleExpression(field, item);
        }
    });
}

SimpleTemplateEngine.prototype.bindArray = function (node/**循环的对象**/, attr) {
    var expression = attr.nodeValue;
    var value = this.getSourceValueWithPath(expression);



    if (!Array.isArray(value)) return;
    value.forEach((item, index) => item.index = index);
    if (!this.listeners[expression]) {
        this.listeners[expression] = [];
    }
    var listener = new ArrayBinder(this, node, expression, null, node.parentNode);
    this.listeners[expression].push(listener);
    this.children.push(listener);
    node.parentNode.removeChild(node);

}
SimpleTemplateEngine.prototype.addListener = function (item, key, attributes) {
   
    if (!this.listeners[key]) {
        this.listeners[key] = [];
    }
    var listener = new DataBinder(this, item, key, attributes);
    this.listeners[key].push(listener);
    this.children.push(listener);
    return listener;
}


// 增加作用域链查询功能
SimpleTemplateEngine.prototype.getSourceValueWithPath = function (path, returnObj) {
    var pathArray = path.split(".");
        var value = this.source[pathArray[0]];
        if( value === void 0 )
            return this.parent
                        ? this.parent.getSourceValueWithPath(path,returnObj)
                        : void 0

    value =this.source;              
    while (pathArray.length > 1) {
        value = value[pathArray.shift()];
    }

    return returnObj ? value : value[pathArray[0]];
}

SimpleTemplateEngine.prototype.handleExpression = function (expression, item, attributes) {
    var filed, filters;
    if (expression.indexOf("|") > -1) { // filters;
        filters = expression.split("|");
        filed = filters[0].trim();
    } else {
        filed = expression;
    }
    this.addListener(item, filed, attributes);
}
