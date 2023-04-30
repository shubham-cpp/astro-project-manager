import { Component, For } from "solid-js";

interface SelectInuputProps{
  label?: string
  options: string[]
  onChange: (value: string | undefined) => void
}

const SelectInput: Component<SelectInuputProps> = props => {

  const handleOptionChange = (event: Event) => {
    const target = event.target as HTMLSelectElement;
    props.onChange(target.value);
  }

  return (
  <label aria-label={`${props.label}-select-label`}>{props.label}
    <select name="choice" class="block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" 
            onChange={handleOptionChange}
    >
      <For each={props.options}>
        {(option, index) => (
          <option value={option} id={`${index}-${option}`}>{option}</option>
        )}
      </For>
    </select>
  </label>  
  
)}

export default SelectInput;