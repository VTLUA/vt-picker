<template>
  <div class="content">
    <div @click="open">{{value}}</div>
    <vtPicker title="选择" :options="data" :prop="props" ref="picker" @submit="submit" :defaultValue="value">
      <template v-slot="scope">{{scope.item.label}} - {{scope.item.value}}</template>
    </vtPicker>
  </div>
</template>
<script>
  import vtPicker from './myPlugin/vtPicker/index'
  export default {
    data () {
      return {
        value: [2, 6],
        data: {
          children: [
            {label: '水果', value: 1, children: [
              {label: '苹果', value: 3},
              {label: '雪梨', value: 4}
            ]},
            {label: '饮品', value: 2, children: [
              {label: '可乐', value: 5},
              {label: '雪碧', value: 6}
            ]}
          ]
        },
        props: {
          label: 'label',
          value: 'value',
          children: 'children'
        }
      }
    },
    components: {
      vtPicker
    },
    methods: {
      open () {
        this.$refs.picker.open()
      },
      submit (val) {
        this.value = val
        console.log(val)
      }
    }
  }
</script>