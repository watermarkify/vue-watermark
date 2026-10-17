import { createRenderer } from 'vue'

// Exercise Vue's real lifecycle and reactivity without requiring a DOM emulator.
// Canvas is mocked separately so tests can inspect the drawing coordinates.
export interface TestNode {
  tag: string
  text: string
  props: Record<string, unknown>
  children: TestNode[]
  parent: TestNode | null
}

export function node(tag: string, text = ''): TestNode {
  return { tag, text, props: {}, children: [], parent: null }
}

export const renderer = createRenderer<TestNode, TestNode>({
  createElement: (tag) => node(tag),
  createText: (text) => node('#text', text),
  createComment: (text) => node('#comment', text),
  setText: (element, text) => {
    element.text = text
  },
  setElementText: (element, text) => {
    element.text = text
  },
  parentNode: (element) => element.parent,
  nextSibling: (element) => {
    const siblings = element.parent?.children ?? []
    return siblings[siblings.indexOf(element) + 1] ?? null
  },
  patchProp: (element, key, _previous, value) => {
    element.props[key] = value
  },
  insert: (element, parent, anchor = null) => {
    if (element.parent) {
      element.parent.children.splice(element.parent.children.indexOf(element), 1)
    }
    const index = anchor ? parent.children.indexOf(anchor) : -1
    parent.children.splice(index < 0 ? parent.children.length : index, 0, element)
    element.parent = parent
  },
  remove: (element) => {
    if (element.parent) {
      element.parent.children.splice(element.parent.children.indexOf(element), 1)
      element.parent = null
    }
  },
})
