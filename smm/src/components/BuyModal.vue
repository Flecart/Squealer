<script lang="ts" setup>
import { ref, getCurrentInstance, nextTick } from 'vue'
import type { BvModal } from 'bootstrap-vue'

defineProps<{
  username: string
}>()

const form = ref<HTMLFormElement | null>(null)
let name = ''
let nameState: boolean | null = null
const submittedNames: string[] = []

// https://github.com/bootstrap-vue/bootstrap-vue/issues/7111
const bvModal = (getCurrentInstance() as any).ctx._bv__modal as BvModal
console.log((getCurrentInstance() as any).ctx)
console.log(Object.keys((getCurrentInstance() as any).ctx))
console.log((getCurrentInstance() as any).ctx._bv__modal)
console.log((getCurrentInstance() as any).ctx.username)
console.log((getCurrentInstance() as any).ctx.$data)
console.log(bvModal)

function checkFormValidity(): boolean {
  if (form.value) {
    const valid = form.value.checkValidity()
    nameState = valid
    return valid
  } else {
    return false
  }
}

function resetModal() {
  name = ''
  nameState = null
}

function handleOk(bvModalEvent) {
  bvModalEvent.preventDefault()
  handleSubmit()
}

function handleSubmit() {
  if (!checkFormValidity()) {
    return
  }
  submittedNames.push(name)
  nextTick(() => {
    console.log('nextTick', bvModal)
    bvModal.hide('modal-prevent-closing')
  })
}
</script>

<template>
  <div>
    <b-button v-b-modal.modal-prevent-closing>Open Modal</b-button>

    <div class="mt-3">
      Submitted Names:
      <div v-if="submittedNames.length === 0">--</div>
      <ul v-else class="mb-0 pl-3">
        <li v-for="name in submittedNames" v-bind:key="name">{{ name }}</li>
      </ul>
    </div>

    <b-modal
      id="modal-prevent-closing"
      ref="modal"
      title="Submit Your Name"
      @show="resetModal"
      @hidden="resetModal"
      @ok="handleOk"
    >
      <form ref="form" @submit.stop.prevent="handleSubmit">
        <b-form-group
          label="Name"
          label-for="name-input"
          invalid-feedback="Name is required"
          :state="nameState"
        >
          <b-form-input id="name-input" v-model="name" :state="nameState" required></b-form-input>
        </b-form-group>
      </form>
    </b-modal>
  </div>
</template>
