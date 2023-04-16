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

export const SecondaryButton: Component<{
  label: string
  onClick: () => void
}> = (props) => {
  return (
    <button
      class="bg-white text-gray-500 rounded-md py-2 px-4 font-medium focus:outline-none hover:text-gray-800"
      onClick={props.onClick}
    >
      {props.label}
    </button>
  )
}