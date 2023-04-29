import type { Component } from "solid-js"

export const Button: Component<{
  label: string
  onClick: () => void
  variant?: "primary" | "secondary"
}> = (props) => {
  return (
    <button
      class={props.variant === 'secondary' ?  'bg-white border  text-gray-500 rounded-md py-2 px-4 font-medium hover:text-gray-950 hover:bg-gray-200 hover:border-primary-dark' : 'bg-primary text-white rounded-md py-2 px-4 font-medium hover:bg-primary-dark'}
      onClick={props.onClick}
    >
      {props.label}
    </button>
  )
}