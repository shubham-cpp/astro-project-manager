import { createSignal } from "solid-js"

const Hello = ({start}) => {
    const [number, setNumber] = createSignal(start ?? 0)

    const add = () => {
        setNumber(number() + 1) 
    }
    const Sub = () => {
        setNumber(number() - 1) 
    }

  return (
    <>
    <div class="p-4 bg-green-500">{number}</div>
    <button onClick={add}>Add</button>
    <button onClick={Sub}>Minus</button>
    </>
  )
}

export default Hello