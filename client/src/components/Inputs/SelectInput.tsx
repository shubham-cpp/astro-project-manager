import { Component, For } from "solid-js";

interface Options {
  label?: string
  value: string
}

interface SelectInuputProps{
  label?: string
  options: (Options | string)[] 
  onChange: (value: string | undefined) => void
}

const SelectInput: Component<SelectInuputProps> = props => {

  const handleOptionChange = (event: Event) => {
    const target = event.target as HTMLSelectElement;
    props.onChange(target.value);
  }
  
  return (
  <label aria-label={`${props.label}-select-label`}>{props.label}
    <select name="choice" class="bg-gray-200 text-gray-700 border border-gray-300 rounded-lg w-64 py-2 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500 p-4 mx-2" 
            onChange={handleOptionChange}
    >
      <For each={props.options}>
        {(option, index) => {
          if (typeof option === 'string') {
            return (
              <option value={option}>
                {option}
              </option>
            )
          } else {
            return (
              <option value={option.value}>
                {option.label || option.value}
              </option>
            )
          }
        }}
      </For>
    </select>
  </label>  
  
)}

export default SelectInput;