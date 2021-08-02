import { createApp } from 'vue'
import App from './App.vue'

import 'xe-utils'
import VXETable from 'vxe-table'
import 'vxe-table/lib/style.css'



const app = createApp(App)
app.use(VXETable)
app.mount('#app')