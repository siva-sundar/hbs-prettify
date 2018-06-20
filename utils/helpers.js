function isTextNode({ type } = {}) {
  return type === 'TextNode';
}

function isBlockStatment({ type } = {}) {
  return type === 'BlockStatement';
}

function isComponentOrHelper(node = {}) {
  let {
    type,
    path
  } = node;
  return type === 'MustacheStatement' && path.original.includes('-');
}

function canIndentNode(node, children, currentIndex) {
  let prevNode = children[currentIndex - 1];
  let nextNode = children[currentIndex + 1];
  if (!prevNode || !nextNode) {
    return true;
  }
  if (isBlockStatment(node) ||
    isComponentOrHelper(node) ||
    (prevNode && prevNode.loc.start.line !== node.loc.end.line) ||
    (node.loc.end.column - node.loc.start.column > 80)) {
    return true;
  }
}

function buildIndentText(indentLevel) {
  return '\n' + '  '.repeat(indentLevel);
}

function buildTextNode(chars) {
  return {
    type: 'TextNode',
    chars
  };
}

function getIndentedText(chars = '', indentLevel = 0, currentIndex = 0, childLength = 0) {
  let actualText = chars.replace(/^(\n| |\t)+/g, '').replace(/(\n| |\t)+$/g, '');
  if (actualText.length) {
    actualText = actualText.split('\n').map((t) => {
      return buildIndentText(indentLevel) + t;
    });
    let x = childLength === currentIndex ? indentLevel - 1 : indentLevel;
    return [...actualText, '\n', '  '.repeat(x)].join('');
  }
  let x = childLength === currentIndex ? indentLevel - 1 : indentLevel;
  return [buildIndentText(x), actualText].join('');
}

function appendTextNode(params, indentText) {
  let mirror = [];

  params.forEach((param) => {
    mirror.push({
      type: 'TextNode',
      chars: indentText
    }, param);
  });
  return mirror;
}

module.exports = {
  isTextNode,
  canIndentNode,
  buildIndentText,
  buildTextNode,
  getIndentedText,
  appendTextNode
};
