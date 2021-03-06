<template>
  <div class="vt-picker" :class="[isOpen ? 'vt-picker--open' : 'vt-picker--close', visible ? '' : 'vt-picker--hide']">
    <div class="vt-picker-content" v-if="isOpen">
      <div class="vt-picker-top">
        <div class="vt-picker-btn--cancel" @click="cancel">取消</div>
        <div class="vt-picker-title">{{title}}</div>
        <div class="vt-picker-btn--submit" @click="submit">确认</div>
      </div>
      <div class="vt-picker-inner" ref="inner">
        <div class="vt-picker-inner-col"
             v-for="(items, i) in computedOption"
             :key="i"
             @touchstart="handlerTouchStart($event, i)"
             @touchmove="handlerTouchMove($event, i)"
             @touchend="handlerTouchEnd($event, i)"
             @touchcancel="handlerTouchEnd($event, i)" :style="{width: 1 / computedOption.length * 100 + '%'}">
          <ul class="vt-picker-inner-row" ref="inner-col">
            <li class="vt-picker-inner-item" v-for="(item, j) in items" :key="j" :style="itemStyle" ref="inner-item">
              <slot :item="item">{{getLabel(item)}}</slot>
            </li>
          </ul>
        </div>
      </div>
    </div>
    <div class="vt-picker-layer" @click="close"></div>
  </div>
</template>

<script>
  import {is} from '../../../src/assets/utils/index'

  export default {
    name: 'vtPicker',
    componentName: 'vtPicker',
    props: {
      title: String,        // 标题
      defaultValue: Array,  // 默认选中值
      options: {         // 下拉选项，回调式：[function() {}]，嵌套式：{children: [{children: []}]}
        type: [Array, Object],
        default () {
          return []
        }
      },
      prop: {
        type: Object,  // 显示的标签和返回的值 {label, value, children}
        default () {
          return {}
        }
      }
    },
    data () {
      return {
        currentValue: this.defaultValue === undefined ? '' : this.defaultValue,

        isOpen: false,
        visible: false,
        renderType: 'function',    // 渲染模式，function：函数回调，object：children子项嵌套模式

        computedOption: [],        // 计算后的下拉选项
        selectedValue: [],         // 已选中的项 index

        innerHeight: 0,            // 下拉框高度
        itemHeight: 0,             // 子项高度
        translate: [],              // 每一列的滚动高度

        transDiff: 0,
        transStart: 0,
        transEnd: 0
      }
    },
    computed: {
      itemStyle () {
        return {
          height: this.itemHeight + 'px',
          lineHeight: this.itemHeight + 'px'
        }
      }
    },
    mounted () {

    },
    methods: {
      // 手动打开弹框
      open () {
        this.isOpen = true
        this.visible = true

        this.$nextTick(() => {
          this.calculate()

          // 滚动到默认值位置
          if (this.currentValue && this.currentValue.length) {
            this.currentValue.forEach((value, i) => {
              let index = this.computedOption[i].findIndex(item => this.getValue(item) === value)
              if (index >= 0 && index < this.computedOption[i].length) {
                let translate = index * this.itemHeight
                this.$set(this.selectedValue, i, index)
                this.$set(this.translate, i, translate)
                this.setPosition(translate, i)
                this.setChildren(this.computedOption[i][index], i)
              }
            })
          }
        })
      },
      close () {
        this.isOpen = false
        setTimeout(() => {
          this.visible = false
        }, 300)
      },
      // 重置选项
      reset () {
        this.$set(this, 'selectedValue', this.selectedValue.map(() => 0))
        this.$set(this, 'translate', this.translate.map(() => 0))
      },
      // 取消
      cancel () {
        this.$emit('cancel')
        this.reset()
        this.close()
      },
      // 确定
      submit () {
        let value = this.selectedValue.map((value, index) => this.getValue(this.computedOption[index][value]))
        this.currentValue = value
        this.$emit('submit', value)
        this.reset()
        this.close()
      },
      // 滚动方法
      handlerTouchStart (e, index) {
        let cols = this.$refs['inner-col'][index]

        this.transDiff = this.translate[index]
        this.transStart = e.touches[0].clientY
        cols.style.transition = cols.style.webkitTransition = `none`
      },
      // 滚动方法
      handlerTouchMove (e, index) {
        e.preventDefault()
        e.stopPropagation()

        let cols = this.$refs['inner-col'][index]
        // 当前滚动的位置具体数值
        let translate

        this.transEnd = e.touches[0].clientY
        translate = this.transDiff + this.transStart - this.transEnd
        this.translate[index] = translate
        cols.style.transform = cols.style.webkitTransform = `translateY(${this.itemHeight * 2 - translate}px)`
      },
      // 滚动方法
      handlerTouchEnd (e, index) {
        e.preventDefault()
        e.stopPropagation()

        let cols = this.$refs['inner-col'][index]

        // 当前滚动的位置具体数值
        let translate
        // 当前滚动到的项index
        let selected

        // 当前滚动到的项index
        selected = Math.round(this.translate[index] / this.itemHeight)

        if (selected < 0) {
          selected = 0
        }
        if (selected >= this.computedOption[index].length) {
          selected = this.computedOption[index].length - 1
        }
        translate = selected * this.itemHeight

        this.$set(this.selectedValue, index, selected)
        this.$set(this.translate, index, translate)
        cols.style.transition = cols.style.webkitTransition = ''

        this.setChildren(this.computedOption[index][selected], index)
        cols.style.transform = cols.style.webkitTransform = `translateY(${this.itemHeight * 2 - translate}px)`
      },
      // 设置列表滚动定位
      setPosition (translate, index) {
        let cols = this.$refs['inner-col']
        if (cols && cols[index]) {
          cols[index].style.transform = cols[index].style.webkitTransform = `translateY(${this.itemHeight * 2 - translate}px)`
        }
      },
      // 设置子列表项
      setChildren (selected, index) {
        if (this.renderType === 'function') {
          this.options.forEach((item, i) => {
            if (i > index) {
              let result = item.apply(null, this.selectedValue.slice(0, i).map((item, index) => this.computedOption[index][item]))
              this.$set(this.computedOption, i, result)

              if (!this.selectedValue[i] || this.selectedValue[i] >= result.length) {
                this.$set(this.translate, i, 0)
                this.$set(this.selectedValue, i, 0)
                this.setPosition(0, i)
              }
            }
          })
        } else if (this.renderType === 'object') {
          let find = (target, i) => {
            let children = this.getChildren(target)

            if (children && children.length) {
              this.$set(this.computedOption, i, children)

              if (!this.selectedValue[i] || this.selectedValue[i] >= children.length) {
                this.$set(this.translate, i, 0)
                this.$set(this.selectedValue, i, 0)
                this.setPosition(0, i)
              }

              find(children[0], i + 1)
            }
          }
          find(selected, index + 1)
        }
      },
      // 计算子项高度
      calculate () {
        if (this.$refs.inner) {
          this.innerHeight = this.$refs.inner.offsetHeight
          this.itemHeight = Math.round(this.innerHeight / 5)
          this.translate.map((translate, index) => {
            this.setPosition(translate, index)
          })
        }
      },

      getLabel (target) {
        return this.prop.label && is(target, 'object') ? target[this.prop.label] : target
      },
      getValue (target) {
        return this.prop.value && is(target, 'object') ? target[this.prop.value] : target
      },
      getChildren (target) {
        return this.prop.children && is(target, 'object') ? target[this.prop.children] : target
      }
    },
    watch: {
      'options': {
        handler (val) {
          if (is(val, 'array') && val.every(item => is(item, 'function'))) {
            this.renderType = 'function'
            this.setChildren(null, -1)

          } else if (is(val, 'object') && Array.isArray(val[this.prop.children])) {
            this.renderType = 'object'
            this.setChildren(val, -1)
          }
        },
        immediate: true
      },
      'defaultValue' (val) {
        if (this.currentValue !== val) {
          this.currentValue = val
        }
      }
    },
  }
</script>

<style lang="less" scoped>

  @keyframes up {
    from {
      transform: translateY(100%);
    }
    to {
      transform: translateY(0);
    }
  }
  @keyframes down {
    from {
      transform: translateY(0);
    }
    to {
      transform: translateY(100%);
    }
  }
  @keyframes in {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
  @keyframes out {
    from {
      opacity: 1;
    }
    to {
      opacity: 0;
    }
  }

  .vt-picker {
    position: fixed;
    z-index: 9999;
    left: 0;
    top: 0;
    display: flex;
    flex-direction: column-reverse;
    width: 100%;
    height: 100%;

    * {
      box-sizing: border-box;
    }

    &--open {
      display: flex;
      .vt-picker-content {
        animation: up 0.3s ease 1 forwards;
      }
      .vt-picker-layer {
        animation: in 0.3s ease 1 forwards;
      }
    }

    &--close {
      .vt-picker-content {
        animation: down 0.3s ease 1 forwards;
      }
      .vt-picker-layer {
        animation: out 0.3s ease 1 forwards;
      }
    }
    &--hide {
      display: none;
    }

    &-content {
      position: relative;
      z-index: 1;
      font-size: 16px;
      color: #333;
      background-color: #fff;
    }
    &-layer {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      z-index: 0;
      background-color: rgba(0, 0, 0, 0.5);
    }
    &-top {
      height: 44px;
      line-height:44px;
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      border-top: 1px solid #ebedf0;
      border-bottom: 1px solid #ebedf0;
    }
    &-btn {
      &--cancel,
      &--submit {
        font-size: 14px;
        color: #3388FF;
        margin: 0px 20px;
      }
    }
    &-inner {
      height: 194px;
      display: flex;
      flex-direction: row;
      flex-wrap: nowrap;
      overflow: hidden;

      &-col {
        flex: 1;
        height: 100%;
        text-align: center;
        position: relative;
        z-index: 1;

        &::before,
        &::after {
          content: '';
          position: absolute;
          left: 0;
          z-index: 3;
          display: block;
          width: 100%;
          height: 40%;
        }
        &::before {
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.4) 100%);
          top: 0;
          border-bottom: 1px solid #ebedf0;
        }
        &::after {
          background: linear-gradient(0deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.4) 100%);
          bottom: 0;
          border-top: 1px solid #ebedf0;
        }
      }
      &-row {
        list-style: none;
        padding: 0;
        margin: 0;
        transition: all 0.3s ease;
      }
      &-item {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
  }
</style>
