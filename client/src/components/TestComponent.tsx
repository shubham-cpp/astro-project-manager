import type { Component } from "solid-js";
import { Tab, Tabs } from "./Tab";
import Modal from "./Modal";

export const TestComponent: Component<any> = (props) => {
  return(
    <Modal title="Modal Title" buttonTitle="Modal Test">
      <div style="m-w: 40px">
      <Tabs title="Tabs">
        <Tab title="Tab 1">
          <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Temporibus perspiciatis vero fuga sequi tempora quaerat dolor laudantium voluptatum vel mollitia laborum porro illum recusandae obcaecati sunt, ipsam commodi maxime a enim ad. Perspiciatis ratione illum enim, quasi quas nemo laboriosam in aut reiciendis, porro error ad, saepe quae nostrum. Eum rem, dolorem accusantium est odit deleniti. Quisquam dignissimos temporibus hic ratione culpa odio assumenda, mollitia saepe magni esse sit, excepturi nulla voluptas laudantium sint qui ab soluta rerum pariatur quas, id quia? Porro quaerat laudantium quasi error, aliquam ad, ipsam voluptas ducimus accusantium autem odit dolorum optio, laboriosam sint? Ducimus.</p>
        </Tab>
        <Tab title="Tab 2">
          <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Temporibus perspiciatis vero fuga sequi tempora quaerat dolor laudantium voluptatum vel mollitia laborum porro illum recusandae obcaecati sunt, ipsam commodi maxime a enim ad. Perspiciatis ratione illum enim, quasi quas nemo laboriosam in aut reiciendis, porro error ad, saepe quae nostrum. Eum rem, dolorem accusantium est odit deleniti. Quisquam dignissimos temporibus hic ratione culpa odio assumenda, mollitia saepe magni esse sit, excepturi nulla voluptas laudantium sint qui ab soluta rerum pariatur quas, id quia? Porro quaerat laudantium quasi error, aliquam ad, ipsam voluptas ducimus accusantium autem odit dolorum optio, laboriosam sint? Ducimus.</p>
        </Tab>
      </Tabs>
      </div>
    </Modal>
  )
}