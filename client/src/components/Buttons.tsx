import type { Component, JSXElement} from "solid-js"

export const Button: Component<{
  children: JSXElement | JSXElement[]
  onClick: () => void
  variant?: "primary" | "secondary"
}> = (props) => {
  return (
    <button
      class={ props.variant === 'secondary' ?  
            'bg-white border  text-gray-500 rounded-md py-2 px-4 font-medium hover:text-gray-950 hover:bg-gray-200 hover:border-primary focus:bg-gray-200' 
            : 'bg-primary text-white rounded-md py-2 px-4 font-medium hover:bg-primary-dark'}
      onClick={props.onClick}
      type="button"
    >
      {props.children} 
    </button>
  )
}