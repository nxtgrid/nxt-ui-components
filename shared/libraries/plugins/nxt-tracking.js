// import VueGtag, { config } from 'vue-gtag';
import VueHotjar from 'vue-hotjar-next';

const { VITE_CONTEXT, /* VITE_GA4_MEASUREMENT_ID, */ VITE_HOTJAR_SITE_ID  } = import.meta.env;
const isProd = VITE_CONTEXT === 'production';

// let cached_member_id;

// const pageTrackerTemplate = to => {
//   const accountStore = useAccountStore();
//   const member_id = accountStore.myProfile?.id;
//   if(member_id && member_id !== cached_member_id) {
//     config({ member_id });
//     cached_member_id = member_id;
//   }

//   return {
//     page_path: to.path,
//     member_id,
//     member_organization: accountStore.myOrganization?.name,
//   };
// };

export const nxtTracking = {
  install(app) {
    if(!isProd) return;

    app
    // .use(VueGtag, {
    //   // bootstrap: false,
    //   // deferScriptLoad: true,
    //   pageTrackerTemplate,
    //   config: { id: VITE_GA4_MEASUREMENT_ID },
    // }, router)
      .use(VueHotjar, { id: parseInt(VITE_HOTJAR_SITE_ID) })
    ;
  },
};
