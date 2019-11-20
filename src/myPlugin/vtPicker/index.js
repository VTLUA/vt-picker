import VtPicker from './vtPicker.vue'

// 注册组件
VtPicker.install = Vue => Vue.component(VtPicker.name, VtPicker);

// 支持使用标签的方式引入 Vue是全局变量时，自动install
if (typeof window !== 'undefined' && window.Vue) {
 install(window.Vue);
}

export default VtPicker