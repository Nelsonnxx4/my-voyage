import { createApp } from "vue";
import "./assets/style.scss";
import App from "./App.vue";
import { router } from "./router";
import PrimeVue from "primevue/config";
import * as icons from "@/assets/icons/index";

const app = createApp(App);

Object.entries(icons).forEach(([name, component]) => {
  app.component(name, component);
});

app.use(router);
app.use(PrimeVue);
app.mount("#app");
