import { Component, JSXElement, Show, createSignal } from 'solid-js'
import { Button } from './Buttons'

interface ModalProps{
  buttonTitle?: string
  title?: string
  action?: string
  cancel?: string
  actionOnClick?: () => void
  children?: JSXElement
  large?: boolean
  medium?: boolean
}

const Modal: Component<ModalProps> = props => {
  const [show, setShow] = createSignal(false)

  return (
    <>
    <Button onClick={() => setShow(true)}><h1>{props.buttonTitle}</h1></Button>
    {show() && ( 
    <dialog open class="inset-0 z-10 overflow-y-auto">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center">
          <div class={`${props.large ? 'max-w-4xl' : props.medium ? 'max-w-2xl' : 'max-w-md' } "absolute bg-white rounded-lg p-8 w-full`}>
            
            <div class="modal-header flex items-center justify-between pb-2">
              <h1 class="modal-title font-bold text-lg align-sub">{props.title}</h1>
              
              <button onClick={() => setShow(false)}>
                <span class="material-symbols-outlined">close</span>
              </button>
            </div>
            
            {props.children}

            <div class='modal-actions pt-2 flex gap-2'>
              {props.action && <Button onClick={() => props.actionOnClick && props.actionOnClick()}><h1>{props.action}</h1></Button>}
              {props.cancel && <Button variant='secondary' onClick={() => setShow(false)}><h1>{props.cancel}</h1></Button>}
            </div>
          
          </div>
      </div>
    </dialog>)
    }
    </>   
  )
}

export default Modal