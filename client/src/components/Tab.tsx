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
              class={`${activeIndex() === index()
                  ? 'bg-primary text-white'
                  : 'bg-white text-gray-500 hover:text-gray-800'
                } rounded-md py-2 px-4 font-medium focus:outline-none`}
            >
              {child.title ?? 'Undefined'}
              <p>{JSON.stringify(child.label, null, 2)}</p>
            </button>
          )}
        </For>
      </div>
      <For each={props.children}>
        {(child, index) => (
          <section
            id={`panel-${index()}`}
            role="tabpanel"
            tabindex={activeIndex() === index() ? 0 : -1}
            aria-labelledby={`tab-${index()}`}
            hidden={activeIndex() !== index()}
          >
            {child?.children ?? null}
          </section>
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
