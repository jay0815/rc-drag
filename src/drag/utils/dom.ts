export function isFunction(func: any): boolean {
  // $FlowIgnore[method-unbinding]
  return typeof func === 'function' || Object.prototype.toString.call(func) === '[object Function]';
}


let matchesSelectorFunc = '';
const methods = [
    'matches',
    'webkitMatchesSelector',
    'mozMatchesSelector',
    'msMatchesSelector',
    'oMatchesSelector'
] as const;
export const matchesSelector = (element: Node, selector: string): boolean => {
  if (!matchesSelectorFunc) {
    for(let i = 0; i < methods.length; i++) {
        const method = methods[i];
        const func = element[method as keyof Node];
        if (func && typeof func === 'function') {
            matchesSelectorFunc = method;
            break; 
        }
    }
  }
  const func = element[matchesSelectorFunc as keyof Node];
  // Might not be found entirely (not an Element?) - in that case, bail
  // $FlowIgnore: Doesn't think elements are indexable
  if (func && typeof func === 'function') { 
    // $FlowIgnore: Doesn't think elements are indexable
    return (func as Function)(selector);
  }
    return false;
}

// Works up the tree to the draggable itself attempting to match selector.
export function matchesSelectorAndParentsTo(element: Node, selector: string, baseNode: Node): boolean {
  let node: Node | null = element;
  do {
    if (matchesSelector(node, selector)) {
        return true;
    }
    if (node === baseNode) {
        return false;
    }
    node = node.parentNode;
  } while (node);

  return false;
}
