<script lang="ts" setup>
defineProps<{
  username: string
}>()
</script>

<template>
  <div>
    <b-button id="show-btn" variant="warning" @click="showModal">buy quota</b-button>

    <b-modal ref="my-modal" hide-footer title="Using Component Methods">
      <div class="d-block text-center">
        <h3>
          Buy quota for <span class="client-name">{{ username }} </span>
        </h3>
      </div>

      <form ref="form" @submit.stop.prevent="handleSubmit">
        <b-form-group label="Montly Quota" label-for="montly-quota">
          <b-form-input
            id="montly-quota"
            type="number"
            v-model="monthQuota"
            @change="handleChange"
          ></b-form-input>
        </b-form-group>

        <b-form-group label="Weekly Quota" label-for="weekly-quota">
          <b-form-input id="weekly-quota" type="number" v-model="weekQuota"></b-form-input>
        </b-form-group>

        <b-form-group label="Daily Quota" label-for="daily-quota">
          <b-form-input id="daily-quota" type="number" v-model="dayQuota"></b-form-input>
        </b-form-group>

        <div>
          <h3>Total Cost: {{ totalCost }}</h3>
        </div>

        <button type="submit" class="btn btn-primary">Submit</button>
      </form>
    </b-modal>
  </div>
</template>

<script lang="ts">
// import { quotaPriceDay, quotaPriceMonth, quotaPriceWeek } from '@model/quota';
// import { type } from 'os';

export default {
  data() {
    return {
      name: '',
      nameState: null,
      dayQuota: 0,
      weekQuota: 0,
      monthQuota: 0,
      totalCost: 0
    }
  },
  methods: {
    showModal() {
      this.$refs['my-modal'].show()
    },
    hideModal() {
      this.$refs['my-modal'].hide()
    },
    handleChange() {
      console.log('changed')
      // console.log(typeof event)
      // console.log(event.target.value)
    },
    handleSubmit() {
      console.log('submitted')
      console.log(this.dayQuota, this.weekQuota, this.monthQuota)
      this.hideModal()
    }
  }
}
</script>

<style scoped>
.client-name {
  font-weight: 700;
  font-size: 1.8rem;
}
</style>
