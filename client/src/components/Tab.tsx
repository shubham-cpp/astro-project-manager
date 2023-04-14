import { children, Component, createSignal, For, JSXElement } from 'solid-js'

interface TabsProps {
  title: string
  children: JSXElement[]
}
function toArray<TChildren>(v: TChildren) {
  return Array.isArray(v) ? v : [v]
}

export const Tabs: Component<TabsProps> = props => {
  const [activeIndex, setActiveIndex] = createSignal(0)
  const handleTabClick = (index: number) => setActiveIndex(index)
  const resolvedChildren = children(() => props.children)
  return (
    <div class="tabs">
      <div role="tablist" aria-label={props.title}>
        <For each={toArray(resolvedChildren())}>
          {(child, index) => (
            <button
              role="tab"
              aria-selected={activeIndex() === index()}
              aria-controls={`panel-${index()}`}
              id={`tab-${index()}`}
              tabindex={activeIndex() === index() ? 0 : -1}
              onClick={() => handleTabClick(index())}
            >
              {child.title ?? 'Undefined'}
              <p>{JSON.stringify(child.label, null, 2)}</p>
            </button>
          )}
        </For>
      </div>
      <For each={props.children}>
        {(child, index) => (
          <div
            id={`panel-${index()}`}
            role="tabpanel"
            tabindex={activeIndex() === index() ? 0 : -1}
            aria-labelledby={`tab-${index()}`}
            hidden={activeIndex() !== index()}
          >
            {child?.children ?? null}
          </div>
        )}
      </For>
    </div>
  )
}

// interface TabProps {
//     title:string
//     children: JSXElement
//   }

export const Tab = (props: any) => props
