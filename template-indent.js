/* eslint-env node */

const {
  isTextNode,
  canIndentNode,
  buildIndentText,
  buildTextNode,
  getIndentedText,
  appendTextNode
} = require('./utils/helpers');



function processParams(node, indentLevel) {
  let {
    loc: {
      start
    }
  } = node;
  let paramsEnd;

  if (node.type === 'MustacheStatement') {
    paramsEnd = node.loc.end;
  } else {
    paramsEnd = node.program.loc.start;
  }

  if (start.line !== paramsEnd.line ||
          (paramsEnd.column - start.column > 80)) {
    let indentText = buildIndentText(indentLevel) + ' ';
    if (node.params.length > 1) {
      node.params = appendTextNode(node.params, indentText);
    }
    if (node.hash.pairs.length > 1) {
      node.hash.pairs = appendTextNode(node.hash.pairs, indentText);
    }
  }
}

function processInnerNodes(node, childPath, indentLevel) {

  let children = node[childPath];
  let mirror = [];
  let childLength = children.length;
  children.forEach((child, index) => {
    if (canIndentNode(child, children, index)) {
      if (isTextNode(child)) {
        child.chars = getIndentedText(child.chars, indentLevel, index, childLength - 1);
        mirror.push(child);
      } else {
        if (!isTextNode(children[index - 1])) {
          mirror.push(buildTextNode(getIndentedText('', indentLevel, index, childLength)));
        }
        mirror.push(child);
      }
    } else {
      mirror.push(child);
    }
  });
  if (!isTextNode(children[children.length - 1])) {
    mirror.push(buildTextNode(getIndentedText('', indentLevel)));
  }
  node[childPath] = mirror;
}

module.exports = function() {
  let parentStack = [];
  return {
    name: 'template-indent-plugin',

    visitor: {
      TextNode(node) {
        /* eslint-disable no-irregular-whitespace */
        node.chars = node.chars.replace(/ /g, '&nbsp;');
        /* eslint-enable no-irregular-whitespace */
      },
      ElementNode: {
        enter(node) {
          let { loc: { start, end } } = node;
          parentStack.push(node);
          if (start.line !== end.line) {
            processInnerNodes(node, 'children', parentStack.length);
          }
        },

        exit() {
          parentStack.pop();
        }
      },

      MustacheStatement(node) {
        processParams(node, parentStack.length);
      },

      BlockStatement: {

        enter(node) {
          processParams(node, parentStack.length + 1);
          parentStack.push(node);
          let { loc: { start, end } } = node;
          if (start.line !== end.line) {
            processInnerNodes(node.program, 'body', parentStack.length);
            if (node.inverse) {
              processInnerNodes(node.inverse, 'body', parentStack.length);
            }
          }
        },

        exit(node) {
          parentStack.pop(node);
        }
      }
    }
  };
};
