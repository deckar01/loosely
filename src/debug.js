/* istanbul ignore file */

export default class Debug {
  static trace(mask) {
    return Debug.traceNode(mask.graph.rootNode);
  }

  static traceNode(node, history = {}, level = '|   ') {
    const id = node.token ? `${node.token.id} ${node.id}` : `<group ${node.id}>`;
    Object.assign(history, { [node.id]: true });
    const traces = node.children.map((child) => {
      if (history[child.id]) return `${level}|\n${level}|---<${child.id}>\n`;
      return Debug.traceNode(child, history, `${level}|   `);
    });
    return `${level}\n${level.slice(0, -3)}---${id}\n${traces.join('')}`;
  }
}
