import { createApp } from 'vue'
import App from './App.vue'

import 'xe-utils'
import VXETable from 'vxe-table'
import 'vxe-table/lib/style.css'

import ElementPlus, { ElMessage } from 'element-plus';
import 'element-plus/lib/theme-chalk/index.css';
import 'dayjs/locale/zh-cn'
import locale from 'element-plus/lib/locale/lang/zh-cn'


const app = createApp(App)
app.use(VXETable)
app.use(ElementPlus, { locale });
app.mount('#app')