import { Component, JSXElement, Show, createSignal } from 'solid-js'
import { Button } from './Buttons'

interface ModalProps{
  buttonTitle?: string
  title?: string
  action?: string
  cancel?: string
  actionOnClick?: () => void
  children?: JSXElement
}

const Modal: Component<ModalProps> = props => {
  const [show, setShow] = createSignal(false)

  return (
    <Show when={show()} fallback={<Button label={props.buttonTitle || 'Undefined'} onClick={() => setShow(true)}/>}>
    <dialog class="modal-wrapper bg-slate-900 bg-opacity-70 z-50 fixed h-screen w-screen top-0 left-0 flex justify-center items-center">
      <div role="alertdialog" aria-modal="true" aria-labelledby={`modal-${props.title}`} 
            class="modal align-super bg-white w-3/4 min-h-0 max-h-3/4 rounded-sm bg-opacity-100 shadow-lg overflow-y-auto p-10">
        <div class="modal-header flex align-super justify-between pb-2">
          <h1 class="text-lg">{props.title}</h1>
          <button onClick={() => setShow(false)}>
            <span class="material-symbols-outlined">close</span>
          </button>          </div>
        <div class="modal-body">
          {props.children}
        </div>
        <div class="modal-actions flex gap-1 pt-2">
          {props.action && <Button label={props.action} onClick={() => props.actionOnClick}/>}
          {props.cancel && <Button variant='secondary' label={props.cancel} onClick={() => setShow(false)}/>}
        </div>
      </div>
    </dialog> 
    </Show>   
  )
}

export default Modal