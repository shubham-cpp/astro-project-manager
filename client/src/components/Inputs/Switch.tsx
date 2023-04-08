import type { Component } from 'solid-js'
import { createSignal } from 'solid-js'

interface SwitchProps {
  label: string
  checked: boolean
  onChange?: (value: boolean) => void
}

const Switch: Component<SwitchProps> = (props: SwitchProps) => {
  const { checked, onChange, label } = props
  const [isChecked, setIsChecked] = createSignal(checked)
  const handleChange = () => {
    setIsChecked(prev => !prev)
    if (typeof onChange == 'function') onChange(!isChecked())
  }
  return (
    <>
      <label class="flex items-center">
        <span class="mr-2">{label}</span>
        <button
          type="button"
          onClick={handleChange}
          class={`${isChecked() ? 'bg-primary' : 'bg-gray-400'
            } relative inline-flex h-6 w-10 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2`}
        >
          <span
            aria-hidden="true"
            class={`${isChecked() ? 'translate-x-4' : 'translate-x-0'
              } inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ease-in-out`}
          />
        </button>
        <span class="ml-2">{isChecked() ? 'On' : 'Off'}</span>
      </label>
    </>
  )
}

export default Switch
