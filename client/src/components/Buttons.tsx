import type { Component } from "solid-js"

export const PrimaryButton: Component<{
  label: string
  onClick: () => void
}> = (props) => {
  return (
    <button
      class="bg-primary text-white rounded-md py-2 px-4 font-medium focus:outline-none hover:bg-primary-dark"
      onClick={props.onClick}
    >
      {props.label}
    </button>
  )
}