class Debug {
  static trace(mask) {
    mask.graph.rootNode
  }
  
  static traceNode(node, history = {}, level = '|   ') {
      const id = node.token ? `${node.token.id} ${node.id}` : `<group ${node.id}>`;
      history[node.id] = true;
      const traces = node.children.map(child => {
          if (history[child.id]) return `${level}|\n${level}|---<${child.id}>\n`;
          else return Debug.traceNode(child, history, level + '|   ');
      });
      return `${level}\n${level.slice(0,-3)}---${id}\n${traces.join('')}`;
  }
}
