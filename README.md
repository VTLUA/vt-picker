# vt-picker

> 仿ios选项框，支持多级联动

## Setup

``` bash

npm i vt-vue-picker

```

## 用法

``` bash

1. import vtPicker from './myPlugin/vtPicker/index' 引进要使用的文件内

2.

<div class="content">
    <div @click="open">{{value}}</div>
    <vtPicker title="选择" :options="data" :prop="props" ref="picker" @submit="submit" :defaultValue="value">
      <template v-slot="scope">{{scope.item.label}} - {{scope.item.value}}</template>
    </vtPicker>
</div>

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

```

For detailed explanation on how things work, consult the [docs for vue-loader](http://vuejs.github.io/vue-loader).
