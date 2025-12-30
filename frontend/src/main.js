import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { createI18n } from 'vue-i18n';

import App from './App.vue';
import router from './router';

import en from './locales/en';
import ua from './locales/ua';

import './assets/main.css';

const app = createApp(App);

const i18n = createI18n({
    legacy: false,
    locale: 'en',
    fallbackLocale: 'en',
    messages: {
        en,
        ua
    }
});

app.use(createPinia());
app.use(router);
app.use(i18n);

app.mount('#app');