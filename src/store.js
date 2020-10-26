import Vue from 'vue'
import Vuex from 'vuex'
// import auth0 from 'auth0-js'
import { Auth0Client } from '@auth0/auth0-spa-js';
import router from './router'

Vue.use(Vuex)


export default new Vuex.Store({
  state: {
    userIsAuthorized:false,
    // auth0: new auth0.WebAuth({
    //   domain: process.env.VUE_APP_AUTH0_CONFIG_DOMAIN +'/Account/Login',
    //   clientID: encodeURI('LopiaUATAuthCodeClient'),
    //   redirectUri: process.env.VUE_APP_DOMAINURL + '/auth-callback',
    //   responseType: process.env.VUE_APP_AUTH0_CONFIG_RESPONSETYPE,
    //   scope: process.env.VUE_APP_AUTH0_CONFIG_SCOPE,
    // }),
     auth0 :new Auth0Client({
         domain: process.env.VUE_APP_AUTH0_CONFIG_DOMAIN +'/Account/Login',
         clientID: encodeURI('LopiaUATAuthCodeClient'),
    })
  },
  mutations: {
    setUserIsAuthenticated(state, replacement){
      state.userIsAuthorized = replacement;
    }
  },
  actions: {
    async auth0Login(context){
      await context.state.auth0.loginWithRedirect({
         'ReturnUrl' : encodeURI('/connect/authorize/callback?client_id=LopiaUATAuthCodeClient&code_challenge=' +
            encodeURI('j9uxOYTTN4xNFXWfqWprIv-Z8MXBYCTQ7xp2VwzfCx0') + '&redirect_uri=' +
            encodeURI('http://localhost:8080/auth-callback') + '&scope=' +
            encodeURI(process.env.VUE_APP_AUTH0_CONFIG_SCOPE) + '&state=307c165a55864a20b998a3a1816de6ff' + '&code_challenge_method=S256&response_mode=query'),
      });

      // console.log("in a store action named auth0Login");
      // context.state.auth0.authorize( {
      //   'ReturnUrl' : encodeURI('/connect/authorize/callback?client_id=LopiaUATAuthCodeClient&code_challenge=' +
      //       encodeURI('j9uxOYTTN4xNFXWfqWprIv-Z8MXBYCTQ7xp2VwzfCx0') + '&redirect_uri=' +
      //       encodeURI('http://localhost:8080/auth-callback') + '&scope=' +
      //       encodeURI(process.env.VUE_APP_AUTH0_CONFIG_SCOPE) + '&state=307c165a55864a20b998a3a1816de6ff' + '&code_challenge_method=S256&response_mode=query'),
      // })
    },
    auth0HandleAuthentication (context) {
      context.state.auth0.parseHash((err, authResult) => {
        if (authResult && authResult.accessToken && authResult.idToken) {
          let expiresAt = JSON.stringify(
            authResult.expiresIn * 1000 + new Date().getTime()
          )
          // save the tokens locally
          localStorage.setItem('access_token', authResult.accessToken);
          localStorage.setItem('id_token', authResult.idToken);
          localStorage.setItem('expires_at', expiresAt);  

          router.replace('/members');
        } 
        else if (err) {
          alert('login failed. Error #KJN838');
          router.replace('/login');
          console.log(err);
        }
      })
    },
    auth0Logout (context) {
      // No need to update the bearer in global axiosConfig to null because we are redirecting out of the application
      // Clear Access Token and ID Token from local storage
      localStorage.removeItem('access_token');
      localStorage.removeItem('id_token');
      localStorage.removeItem('expires_at');

      // redirect to auth0 logout to completely log the user out
      window.location.href = process.env.VUE_APP_AUTH0_CONFIG_DOMAINURL + "/v2/logout?returnTo=" + process.env.VUE_APP_DOMAINURL + "/login&client_id=" + process.env.VUE_APP_AUTH0_CONFIG_CLIENTID;
    },    
  }
})
